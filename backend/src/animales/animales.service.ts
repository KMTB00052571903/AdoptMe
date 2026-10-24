import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { EstadoAnimal } from '../common/enums/estado-animal.enum';
import { SolicitudAdopcion } from '../solicitudes/entities/solicitud-adopcion.entity';
import { Fundacion } from '../usuarios/entities/fundacion.entity';
import { AnimalRulesService } from './animal-rules.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { FilterAnimalesDto } from './dto/filter-animales.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { UpdateEstadoAnimalDto } from './dto/update-estado-animal.dto';
import { Animal } from './entities/animal.entity';
import { FichaSalud } from './entities/ficha-salud.entity';
import { FotoAnimal } from './entities/foto-animal.entity';

@Injectable()
export class AnimalesService {
  constructor(
    @InjectRepository(Animal)
    private readonly animalesRepository: Repository<Animal>,
    @InjectRepository(Fundacion)
    private readonly fundacionesRepository: Repository<Fundacion>,
    @InjectRepository(SolicitudAdopcion)
    private readonly solicitudesRepository: Repository<SolicitudAdopcion>,
    private readonly animalRules: AnimalRulesService,
    private readonly dataSource: DataSource,
  ) {}

  // HU01: publicar un animal con su ficha de salud y sus fotos.
  async create(dto: CreateAnimalDto): Promise<Animal> {
    const existeFundacion = await this.fundacionesRepository.existsBy({
      id: dto.fundacionId,
    });
    if (!existeFundacion) {
      throw new NotFoundException(`Fundación ${dto.fundacionId} no encontrada`);
    }

    const { fotos, fichaSalud, ...datosAnimal } = dto;

    // Transacción: se guardan el animal, su ficha y sus fotos, o no se guarda
    // nada. Así no queda un animal a medias si falla una de las partes.
    const animalId = await this.dataSource.transaction(async (manager) => {
      const animal = await manager.save(manager.create(Animal, datosAnimal));

      await manager.save(
        manager.create(FichaSalud, { ...fichaSalud, animalId: animal.id }),
      );

      // La primera URL de la lista queda como foto principal (orden 1).
      await manager.save(
        fotos.map((url, index) =>
          manager.create(FotoAnimal, {
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

  // HU02: catálogo con filtros y paginación (RNF04).
  async findAll(filtros: FilterAnimalesDto) {
    const { especie, tamano, ciudad, edadMinMeses, edadMaxMeses, page, limit } =
      filtros;

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
      estado: In([EstadoAnimal.DISPONIBLE, EstadoAnimal.EN_PROCESO]),
    };
    if (especie) where.especie = especie;
    if (tamano) where.tamano = tamano;
    if (ciudad) where.fundacion = { ciudad: ILike(ciudad) };

    if (edadMinMeses !== undefined && edadMaxMeses !== undefined) {
      where.edadAproximadaMeses = Between(edadMinMeses, edadMaxMeses);
    } else if (edadMinMeses !== undefined) {
      where.edadAproximadaMeses = MoreThanOrEqual(edadMinMeses);
    } else if (edadMaxMeses !== undefined) {
      where.edadAproximadaMeses = LessThanOrEqual(edadMaxMeses);
    }

    const [data, total] = await this.animalesRepository.findAndCount({
      where,
      relations: { fotos: true, fundacion: true },
      order: { fechaIngreso: 'DESC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    data.forEach((animal) => this.ordenarFotos(animal));

    return { data, total, page, limit };
  }

  // Detalle de un animal. 404 si no existe.
  async findOne(id: string): Promise<Animal> {
    const animal = await this.animalesRepository.findOne({
      where: { id },
      relations: { fotos: true, fichaSalud: true, fundacion: true },
    });
    if (!animal) {
      throw new NotFoundException(`Animal ${id} no encontrado`);
    }
    return this.ordenarFotos(animal);
  }

  // PATCH: solo se actualizan los campos que llegaron.
  async update(id: string, dto: UpdateAnimalDto): Promise<Animal> {
    await this.findOne(id);

    const cambios = Object.fromEntries(
      Object.entries(dto).filter(([, valor]) => valor !== undefined),
    );
    if (Object.keys(cambios).length > 0) {
      await this.animalesRepository.update(id, cambios);
    }

    return this.findOne(id);
  }

  // Cambio de estado manual. Las reglas las decide AnimalRulesService (409).
  async cambiarEstado(id: string, dto: UpdateEstadoAnimalDto): Promise<Animal> {
    const animal = await this.findOne(id);
    this.animalRules.assertCambioEstadoManual(animal.estado, dto.estado);

    await this.animalesRepository.update(id, { estado: dto.estado });
    return this.findOne(id);
  }

  // Eliminar. Las fotos y la ficha se borran solas (ON DELETE CASCADE).
  async remove(id: string): Promise<{ deleted: number }> {
    await this.findOne(id);

    const cantidadSolicitudes = await this.solicitudesRepository.count({
      where: { animalId: id },
    });
    this.animalRules.assertPuedeEliminar(cantidadSolicitudes);

    const result = await this.animalesRepository.delete(id);
    return { deleted: result.affected ?? 0 };
  }

  // La foto con orden 1 (la principal) queda siempre de primera.
  private ordenarFotos(animal: Animal): Animal {
    animal.fotos?.sort((a, b) => a.orden - b.orden);
    return animal;
  }
}