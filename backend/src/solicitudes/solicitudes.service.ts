import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudAdopcion } from './entities/solicitud-adopcion.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { EstadoSolicitud } from 'src/common/enums/estado-solicitud.enum';
import { AprobadoService } from './rules/solicitudes-aprobado.service';
import { RechazadoService } from './rules/solicitudes-rechazado.service';
import { Adoptante } from 'src/usuarios/entities/adoptante.entity';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(SolicitudAdopcion)
    private readonly solicitudRepository: Repository<SolicitudAdopcion>,

    @InjectRepository(Adoptante)
    private readonly adoptanteRepository: Repository<Adoptante>,

    private readonly aprobadoService: AprobadoService,
    private readonly rechazadoService: RechazadoService,
  ) {}

  async create(
    createSolicitudDto: CreateSolicitudDto,
  ): Promise<SolicitudAdopcion> {
    const adoptante = await this.adoptanteRepository.findOneBy({
      id: createSolicitudDto.adoptanteId,
    });

    const animal = await this.solicitudRepository.findOneBy({
      id: createSolicitudDto.animalId,
    });

    if (!adoptante) {
      throw new NotFoundException(
        `Adoptante con ID ${createSolicitudDto.adoptanteId} no existe`,
      );
    } else if (!animal) {
      throw new NotFoundException(
        `Animal con ID ${createSolicitudDto.animalId} no existe`,
      );
    }

    const request = this.solicitudRepository.create({
      animal,
      adoptante,
      motivacion: createSolicitudDto.motivacion,
      condicionesHogar: createSolicitudDto.condicionesHogar,
      estado: EstadoSolicitud.PENDIENTE,
    });

    return this.solicitudRepository.save(request);
  }

  async findOne(id: string): Promise<SolicitudAdopcion> {
    const request = await this.solicitudRepository.findOne({
      where: { id },
      relations: {
        adoptante: true,
        animal: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`solicitud con ID ${id} no existe`);
    }

    return request;
  }

  async aprove(id: string): Promise<SolicitudAdopcion> {
    const request = await this.findOne(id);

    this.aprobadoService.ensureNotTaken(request);

    request.estado = EstadoSolicitud.APROBADA;

    return this.solicitudRepository.save(request);
  }

  async deny(id: string): Promise<SolicitudAdopcion> {
    const request = await this.findOne(id);

    this.rechazadoService.ensureHasMotive(request);

    request.estado = EstadoSolicitud.RECHAZADA;

    return this.solicitudRepository.save(request);
  }
}
