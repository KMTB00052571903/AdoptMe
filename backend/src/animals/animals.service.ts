import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
  Repository,
} from 'typeorm';
import { AnimalStatus } from '../common/enums/animal-status.enum';
import { SolicitudAdopcion } from '../adoption-requests/entities/adoption-request.entity';
import { Fundacion } from '../users/entities/foundation.entity';
import { AnimalRulesService } from './animal-rules.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { FilterAnimalsDto } from './dto/filter-animals.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { UpdateAnimalStatusDto } from './dto/update-animal-status.dto';
import { Animal } from './entities/animal.entity';
import { HealthRecord } from './entities/health-record.entity';
import { AnimalPhoto } from './entities/animal-photo.entity';

@Injectable()
export class AnimalsService {
  constructor(
    @InjectRepository(Animal)
    private readonly animalsRepository: Repository<Animal>,
    @InjectRepository(Fundacion)
    private readonly foundationsRepository: Repository<Fundacion>,
    @InjectRepository(SolicitudAdopcion)
    private readonly requestsRepository: Repository<SolicitudAdopcion>,
    private readonly animalRules: AnimalRulesService,
    private readonly dataSource: DataSource,
  ) {}

  // HU01: publicar un animal con su ficha de salud y sus fotos.
  // fundacionId viene del token (el controlador lo saca de req.user).
  async create(dto: CreateAnimalDto, fundacionId: string): Promise<Animal> {
    const foundationExists = await this.foundationsRepository.existsBy({
      id: fundacionId,
    });
    if (!foundationExists) {
      throw new NotFoundException(`Fundación ${fundacionId} no encontrada`);
    }

    const { fotos, fichaSalud, ...animalData } = dto;

    // Transacción: se guardan el animal, su ficha y sus fotos, o no se guarda
    // nada. Así no queda un animal a medias si falla una de las partes.
    const animalId = await this.dataSource.transaction(async (manager) => {
      const animal = await manager.save(
        manager.create(Animal, { ...animalData, fundacionId }),
      );

      await manager.save(
        manager.create(HealthRecord, { ...fichaSalud, animalId: animal.id }),
      );

      // La primera URL de la lista queda como foto principal (orden 1).
      await manager.save(
        fotos.map((url, index) =>
          manager.create(AnimalPhoto, {
            animalId: animal.id,
            url,
            orden: index + 1,
          }),
        ),
      );

      return animal.id;
    });

    return this.findOne(animalId);
  }

  // HU02: catálogo con filters y paginación (RNF04).
  async findAll(filters: FilterAnimalsDto) {
    const { especie, tamano, ciudad, edadMinMeses, edadMaxMeses, page, limit } =
      filters;

    if (
      edadMinMeses !== undefined &&
      edadMaxMeses !== undefined &&
      edadMinMeses > edadMaxMeses
    ) {
      throw new BadRequestException(
        'edadMinMeses no puede ser mayor que edadMaxMeses',
      );
    }

    // El catálogo público solo muestra animales que se pueden pedir:
    // disponibles o en proceso (todavía reciben solicitudes).
    const where: FindOptionsWhere<Animal> = {
      estado: In([AnimalStatus.AVAILABLE, AnimalStatus.IN_PROCESS]),
    };
    if (especie) where.especie = especie;
    if (tamano) where.tamano = tamano;

    // unaccent quita las tildes y ILIKE ignora mayúsculas:
    // "bogota", "Bogota" y "BOGOTÁ" encuentran "Bogotá".
    // :ciudad es un parámetro: TypeORM lo escapa (sin riesgo de inyección SQL).
    if (ciudad) {
      where.fundacion = {
        ciudad: Raw(
          (columna) => `unaccent(${columna}) ILIKE unaccent(:ciudad)`,
          { ciudad },
        ),
      };
    }

    if (edadMinMeses !== undefined && edadMaxMeses !== undefined) {
      where.edadAproximadaMeses = Between(edadMinMeses, edadMaxMeses);
    } else if (edadMinMeses !== undefined) {
      where.edadAproximadaMeses = MoreThanOrEqual(edadMinMeses);
    } else if (edadMaxMeses !== undefined) {
      where.edadAproximadaMeses = LessThanOrEqual(edadMaxMeses);
    }

    const [data, total] = await this.animalsRepository.findAndCount({
      where,
      relations: { fotos: true, fundacion: true },
      order: { fechaIngreso: 'DESC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    data.forEach((animal) => this.sortPhotos(animal));

    return { data, total, page, limit };
  }

  // Detalle de un animal. 404 si no existe.
  async findOne(id: string): Promise<Animal> {
    const animal = await this.animalsRepository.findOne({
      where: { id },
      relations: { fotos: true, fichaSalud: true, fundacion: true },
    });
    if (!animal) {
      throw new NotFoundException(`Animal ${id} no encontrado`);
    }
    return this.sortPhotos(animal);
  }

  // "Mis animales": todos los animales de una fundación, en cualquier estado.
  // El catálogo público (findAll) solo muestra disponibles y en proceso.
  async findMine(fundacionId: string): Promise<Animal[]> {
    const animals = await this.animalsRepository.find({
      where: { fundacionId },
      relations: { fotos: true },
      order: { fechaIngreso: 'DESC', id: 'ASC' },
    });
    animals.forEach((animal) => this.sortPhotos(animal));
    return animals;
  }

  // PATCH: solo se actualizan los campos que llegaron.
  // 403 si el animal es de otra fundación.
  async update(
    id: string,
    dto: UpdateAnimalDto,
    userFoundationId: string,
  ): Promise<Animal> {
    const animal = await this.findOne(id);
    this.animalRules.assertBelongsToFoundation(
      animal.fundacionId,
      userFoundationId,
    );

    const changes = Object.fromEntries(
      Object.entries(dto).filter(([, valor]) => valor !== undefined),
    );
    if (Object.keys(changes).length > 0) {
      await this.animalsRepository.update(id, changes);
    }

    return this.findOne(id);
  }

  // Cambio de estado manual. Las reglas las decide AnimalRulesService:
  // 403 si es de otra fundación, 409 si la transición no está permitida.
  async changeStatus(
    id: string,
    dto: UpdateAnimalStatusDto,
    userFoundationId: string,
  ): Promise<Animal> {
    const animal = await this.findOne(id);
    this.animalRules.assertBelongsToFoundation(
      animal.fundacionId,
      userFoundationId,
    );
    this.animalRules.assertManualStatusChange(animal.estado, dto.estado);

    await this.animalsRepository.update(id, { estado: dto.estado });
    return this.findOne(id);
  }

  // Cambio de estado desde Solicitudes (F2). No es un endpoint.
  // Lo llama SolicitudesService: en_proceso al crear, adoptado al aprobar,
  // disponible si se rechazan todas. Si se pasa un manager, el cambio queda
  // dentro de la misma transacción de quien lo llama (todo o nada).
  async updateStatusFromRequest(
    animalId: string,
    next: AnimalStatus,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(Animal)
      : this.animalsRepository;

    const animal = await repository.findOne({ where: { id: animalId } });
    if (!animal) {
      throw new NotFoundException(`Animal ${animalId} no encontrado`);
    }

    this.animalRules.assertStatusChangeFromRequest(animal.estado, next);

    if (animal.estado !== next) {
      await repository.update(animalId, { estado: next });
    }
  }

  // Eliminar. Las fotos y la ficha se borran solas (ON DELETE CASCADE).
  // 403 si es de otra fundación, 409 si tiene solicitudes.
  async remove(
    id: string,
    userFoundationId: string,
  ): Promise<{ deleted: number }> {
    const animal = await this.findOne(id);
    this.animalRules.assertBelongsToFoundation(
      animal.fundacionId,
      userFoundationId,
    );

    const requestCount = await this.requestsRepository.count({
      where: { animalId: id },
    });
    this.animalRules.assertCanDelete(requestCount);

    const result = await this.animalsRepository.delete(id);
    return { deleted: result.affected ?? 0 };
  }

  // La foto con orden 1 (la principal) queda siempre de primera.
  private sortPhotos(animal: Animal): Animal {
    animal.fotos?.sort((a, b) => a.orden - b.orden);
    return animal;
  }
}