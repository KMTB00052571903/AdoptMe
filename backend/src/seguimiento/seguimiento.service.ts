import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EstadoCheckpoint } from '../common/enums/estado-checkpoint.enum';
import { EstadoSolicitud } from '../common/enums/estado-solicitud.enum';
import { TipoCheckpoint } from '../common/enums/tipo-checkpoint.enum';
import { SolicitudAdopcion } from '../solicitudes/entities/solicitud-adopcion.entity';
import { ResponderCheckpointDto } from './dto/responder-checkpoint.dto';
import { Checkpoint } from './entities/checkpoint.entity';
import { SeguimientoRulesService } from './seguimiento-rules.service';

@Injectable()
export class SeguimientoService {
  constructor(
    @InjectRepository(Checkpoint)
    private readonly checkpointRepository: Repository<Checkpoint>,
    private readonly seguimientoRulesService: SeguimientoRulesService,
  ) {}

  // Contrato para Solicitudes: llamar DENTRO de la transacción de aprobación,
  // pasando su manager y después de marcar la solicitud como aprobada y fijar
  // fechaResolucion. Si algo falla aquí, toda la aprobación se deshace.
  // Es idempotente: si ya existen checkpoints, solo crea los que falten.
  async crearCheckpointsDeAprobacion(
    manager: EntityManager,
    solicitudId: string,
  ): Promise<Checkpoint[]> {
    const solicitud = await manager.findOne(SolicitudAdopcion, {
      where: { id: solicitudId },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (
      solicitud.estado !== EstadoSolicitud.APROBADA ||
      !solicitud.fechaResolucion
    ) {
      throw new ConflictException(
        'Solo una solicitud aprobada, con fecha de resolución, genera checkpoints',
      );
    }

    const existentes = await manager.find(Checkpoint, {
      where: { solicitudId },
    });
    const fechas = this.seguimientoRulesService.calcularFechasProgramadas(
      solicitud.fechaResolucion,
    );
    const nuevos = [TipoCheckpoint.DIA_30, TipoCheckpoint.DIA_90]
      .filter((tipo) => !existentes.some((c) => c.tipo === tipo))
      .map((tipo) =>
        manager.create(Checkpoint, {
          solicitudId,
          tipo,
          fechaProgramada: fechas[tipo],
          estado: EstadoCheckpoint.PENDIENTE,
        }),
      );
    if (nuevos.length === 0) {
      return existentes;
    }
    return [...existentes, ...(await manager.save(Checkpoint, nuevos))];
  }

  // Solo los checkpoints de solicitudes del adoptante del token.
  async listarMisCheckpoints(
    adoptanteId: string | undefined,
  ): Promise<Checkpoint[]> {
    const propio = this.exigirAdoptanteId(adoptanteId);
    const checkpoints = await this.checkpointRepository.find({
      where: { solicitud: { adoptanteId: propio } },
      order: { fechaProgramada: 'ASC' },
    });

    const vencidos = checkpoints.filter((c) =>
      this.seguimientoRulesService.estaVencido(c, new Date()),
    );
    if (vencidos.length > 0) {
      vencidos.forEach((c) => (c.estado = EstadoCheckpoint.VENCIDO));
      await this.checkpointRepository.save(vencidos);
    }
    return checkpoints;
  }

  async responder(
    checkpointId: string,
    adoptanteId: string | undefined,
    dto: ResponderCheckpointDto,
  ): Promise<Checkpoint> {
    const propio = this.exigirAdoptanteId(adoptanteId);
    // El filtro por adoptante va en la misma consulta: un checkpoint ajeno
    // responde igual que uno inexistente (404) y no revela que existe.
    const checkpoint = await this.checkpointRepository.findOne({
      where: { id: checkpointId, solicitud: { adoptanteId: propio } },
    });
    if (!checkpoint) {
      throw new NotFoundException('Checkpoint no encontrado');
    }

    if (this.seguimientoRulesService.estaVencido(checkpoint, new Date())) {
      checkpoint.estado = EstadoCheckpoint.VENCIDO;
      await this.checkpointRepository.save(checkpoint);
    }
    this.seguimientoRulesService.ensurePuedeResponder(checkpoint);

    checkpoint.comentario = dto.comentario;
    checkpoint.fotoUrl = dto.fotoUrl ?? null;
    checkpoint.fechaRespuesta = new Date();
    checkpoint.estado = EstadoCheckpoint.RESPONDIDO;
    return this.checkpointRepository.save(checkpoint);
  }

  // En TypeORM un where con undefined se ignora: sin este control, un token
  // sin adoptanteId vería los checkpoints de TODOS los adoptantes.
  private exigirAdoptanteId(adoptanteId: string | undefined): string {
    if (!adoptanteId) {
      throw new ForbiddenException(
        'El token no identifica a un adoptante; inicia sesión de nuevo',
      );
    }
    return adoptanteId;
  }
}
