import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { SolicitudAdopcion } from './entities/adoption-request.entity';
import { CreateSolicitudDto } from './dto/create-adoption-request.dto';
import { EstadoSolicitud } from '../common/enums/adoption-request-status.enum';
import { AprobadoService } from './rules/request-approval.service';
import { RechazadoService } from './rules/request-rejection.service';
import { Adoptante } from '../users/entities/adopter.entity';
import { AnimalsService } from '../animals/animals.service';
import { AnimalStatus } from '../common/enums/animal-status.enum';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(SolicitudAdopcion)
    private readonly solicitudRepository: Repository<SolicitudAdopcion>,

    @InjectRepository(Adoptante)
    private readonly adoptanteRepository: Repository<Adoptante>,

    private readonly animalsService: AnimalsService,
    private readonly dataSource: DataSource,
    private readonly aprobadoService: AprobadoService,
    private readonly rechazadoService: RechazadoService,
  ) {}

  async create(
    createSolicitudDto: CreateSolicitudDto,
  ): Promise<SolicitudAdopcion> {
    const adoptante = await this.adoptanteRepository.findOneBy({
      id: createSolicitudDto.adoptanteId,
    });

    if (!adoptante) {
      throw new NotFoundException(
        `Adoptante con ID ${createSolicitudDto.adoptanteId} no existe`,
      );
    }

    const request = this.solicitudRepository.create({
      animalId: createSolicitudDto.animalId,
      adoptante,
      motivacion: createSolicitudDto.motivacion,
      condicionesHogar: createSolicitudDto.condicionesHogar,
      estado: EstadoSolicitud.PENDIENTE,
    });

    return this.dataSource.transaction(async (manager) => {
      await this.animalsService.updateStatusFromRequest(
        createSolicitudDto.animalId,
        AnimalStatus.IN_PROCESS,
        manager,
      );
      return manager.save(manager.create(SolicitudAdopcion, { ...request }));
    });
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

    if (request.estado === EstadoSolicitud.APROBADA) {
      await this.solicitudRepository.update(
        { id: Not(id), animalId: request.animalId },
        { estado: EstadoSolicitud.CERRADA_POR_OTRA_ADOPCION },
      );
    }

    return this.solicitudRepository.save(request);
  }

  async deny(id: string): Promise<SolicitudAdopcion> {
    const request = await this.findOne(id);

    this.rechazadoService.ensureHasMotive(request);

    request.estado = EstadoSolicitud.RECHAZADA;

    return this.solicitudRepository.save(request);
  }
}
