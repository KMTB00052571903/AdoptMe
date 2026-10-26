import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EspecieAnimal } from '../common/enums/especie-animal.enum';
import { EstadoAnimal } from '../common/enums/estado-animal.enum';
import { SexoAnimal } from '../common/enums/sexo-animal.enum';
import { TamanoAnimal } from '../common/enums/tamano-animal.enum';
import { SolicitudAdopcion } from '../solicitudes/entities/solicitud-adopcion.entity';
import { Fundacion } from '../usuarios/entities/fundacion.entity';
import { AnimalRulesService } from './animal-rules.service';
import { AnimalesService } from './animales.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { FilterAnimalesDto } from './dto/filter-animales.dto';
import { Animal } from './entities/animal.entity';
import { FichaSalud } from './entities/ficha-salud.entity';
import { FotoAnimal } from './entities/foto-animal.entity';

describe('AnimalesService', () => {
  let service: AnimalesService;

  // Mocks: reemplazan a los repositorios y al DataSource reales.
  // Se crean de nuevo antes de cada prueba para que no se mezclen.
  let animalesRepository: Record<string, jest.Mock>;
  let fundacionesRepository: Record<string, jest.Mock>;
  let solicitudesRepository: Record<string, jest.Mock>;
  let manager: Record<string, jest.Mock>;
  let dataSource: Record<string, jest.Mock>;

  const dtoCrear: CreateAnimalDto = {
    fundacionId: 'fundacion-1',
    nombre: 'Luna',
    especie: EspecieAnimal.PERRO,
    sexo: SexoAnimal.HEMBRA,
    edadAproximadaMeses: 18,
    tamano: TamanoAnimal.MEDIANO,
    descripcion: 'Tranquila y cariñosa',
    fechaIngreso: '2026-09-15',
    fotos: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    fichaSalud: { vacunasAlDia: true, esterilizado: true },
  };

  beforeEach(async () => {
    animalesRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    fundacionesRepository = { existsBy: jest.fn() };
    solicitudesRepository = { count: jest.fn() };

    // El "manager" de la transacción: create devuelve lo mismo que recibe
    // y save le pone un id al animal (como haría la base de datos).
    manager = {
      create: jest.fn((_entidad, datos) => datos),
      save: jest.fn(async (datos) =>
        Array.isArray(datos) ? datos : { id: 'animal-1', ...datos },
      ),
    };
    // transaction ejecuta el callback pasándole el manager falso.
    dataSource = { transaction: jest.fn((callback) => callback(manager)) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AnimalesService,
        AnimalRulesService, // el real: no tiene dependencias
        { provide: getRepositoryToken(Animal), useValue: animalesRepository },
        {
          provide: getRepositoryToken(Fundacion),
          useValue: fundacionesRepository,
        },
        {
          provide: getRepositoryToken(SolicitudAdopcion),
          useValue: solicitudesRepository,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get(AnimalesService);
  });

  describe('create', () => {
    it('lanza 404 si la fundación no existe y no abre la transacción', async () => {
      fundacionesRepository.existsBy.mockResolvedValue(false);

      await expect(service.create(dtoCrear)).rejects.toThrow(NotFoundException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('guarda el animal, su ficha y las fotos en orden 1, 2...', async () => {
      fundacionesRepository.existsBy.mockResolvedValue(true);
      animalesRepository.findOne.mockResolvedValue({ id: 'animal-1', fotos: [] });

      await service.create(dtoCrear);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.create).toHaveBeenCalledWith(FichaSalud, {
        vacunasAlDia: true,
        esterilizado: true,
        animalId: 'animal-1',
      });
      expect(manager.create).toHaveBeenCalledWith(FotoAnimal, {
        animalId: 'animal-1',
        url: 'https://example.com/1.jpg',
        orden: 1,
      });
      expect(manager.create).toHaveBeenCalledWith(FotoAnimal, {
        animalId: 'animal-1',
        url: 'https://example.com/2.jpg',
        orden: 2,
      });
    });
  });

  describe('findAll', () => {
    it('lanza 400 si edadMinMeses es mayor que edadMaxMeses', async () => {
      const filtros = { edadMinMeses: 24, edadMaxMeses: 12, page: 1, limit: 10 };

      await expect(
        service.findAll(filtros as FilterAnimalesDto),
      ).rejects.toThrow(BadRequestException);
      expect(animalesRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('calcula skip y take según la página', async () => {
      animalesRepository.findAndCount.mockResolvedValue([[], 0]);

      const resultado = await service.findAll({
        page: 3,
        limit: 10,
      } as FilterAnimalesDto);

      expect(animalesRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(resultado).toEqual({ data: [], total: 0, page: 3, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('lanza 404 si el animal no existe', async () => {
      animalesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve las fotos ordenadas, con la principal primero', async () => {
      animalesRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        fotos: [{ orden: 2 }, { orden: 1 }],
      });

      const animal = await service.findOne('animal-1');

      expect(animal.fotos.map((foto) => foto.orden)).toEqual([1, 2]);
    });
  });

  describe('update', () => {
    it('no toca la base si el PATCH llega vacío', async () => {
      animalesRepository.findOne.mockResolvedValue({ id: 'animal-1', fotos: [] });

      await service.update('animal-1', {});

      expect(animalesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('cambiarEstado', () => {
    it('lanza 409 al intentar poner adoptado a mano y no actualiza', async () => {
      animalesRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        estado: EstadoAnimal.DISPONIBLE,
        fotos: [],
      });

      await expect(
        service.cambiarEstado('animal-1', { estado: EstadoAnimal.ADOPTADO }),
      ).rejects.toThrow(ConflictException);
      expect(animalesRepository.update).not.toHaveBeenCalled();
    });

    it('actualiza el estado cuando la transición está permitida', async () => {
      animalesRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        estado: EstadoAnimal.DISPONIBLE,
        fotos: [],
      });

      await service.cambiarEstado('animal-1', {
        estado: EstadoAnimal.NO_DISPONIBLE,
      });

      expect(animalesRepository.update).toHaveBeenCalledWith('animal-1', {
        estado: EstadoAnimal.NO_DISPONIBLE,
      });
    });
  });

  describe('solo la fundación dueña modifica el animal', () => {
    // El animal es de fundacion-1; la petición la hace fundacion-2.
    beforeEach(() => {
      animalesRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        fundacionId: 'fundacion-1',
        estado: EstadoAnimal.DISPONIBLE,
        fotos: [],
      });
    });

    it('update: lanza 403 si el animal es de otra fundación y no actualiza', async () => {
      await expect(
        service.update('animal-1', { nombre: 'Otro' }, 'fundacion-2'),
      ).rejects.toThrow(ForbiddenException);
      expect(animalesRepository.update).not.toHaveBeenCalled();
    });

    it('update: actualiza si el animal es de la misma fundación', async () => {
      await service.update('animal-1', { nombre: 'Otro' }, 'fundacion-1');

      expect(animalesRepository.update).toHaveBeenCalledWith('animal-1', {
        nombre: 'Otro',
      });
    });

    it('cambiarEstado: lanza 403 si el animal es de otra fundación', async () => {
      await expect(
        service.cambiarEstado(
          'animal-1',
          { estado: EstadoAnimal.NO_DISPONIBLE },
          'fundacion-2',
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(animalesRepository.update).not.toHaveBeenCalled();
    });

    it('remove: lanza 403 si el animal es de otra fundación y no borra', async () => {
      await expect(service.remove('animal-1', 'fundacion-2')).rejects.toThrow(
        ForbiddenException,
      );
      expect(solicitudesRepository.count).not.toHaveBeenCalled();
      expect(animalesRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('actualizarEstadoPorSolicitud', () => {
    it('pasa el animal a en_proceso cuando llega la primera solicitud', async () => {
      animalesRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        estado: EstadoAnimal.DISPONIBLE,
      });

      await service.actualizarEstadoPorSolicitud(
        'animal-1',
        EstadoAnimal.EN_PROCESO,
      );

      expect(animalesRepository.update).toHaveBeenCalledWith('animal-1', {
        estado: EstadoAnimal.EN_PROCESO,
      });
    });

    it('no actualiza si el estado ya es el mismo', async () => {
      animalesRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        estado: EstadoAnimal.EN_PROCESO,
      });

      await service.actualizarEstadoPorSolicitud(
        'animal-1',
        EstadoAnimal.EN_PROCESO,
      );

      expect(animalesRepository.update).not.toHaveBeenCalled();
    });

    it('lanza 409 si el animal no está recibiendo solicitudes', async () => {
      animalesRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        estado: EstadoAnimal.NO_DISPONIBLE,
      });

      await expect(
        service.actualizarEstadoPorSolicitud('animal-1', EstadoAnimal.EN_PROCESO),
      ).rejects.toThrow(ConflictException);
      expect(animalesRepository.update).not.toHaveBeenCalled();
    });

    it('usa el repositorio del manager cuando recibe una transacción', async () => {
      const repoTransaccion = {
        findOne: jest.fn().mockResolvedValue({
          id: 'animal-1',
          estado: EstadoAnimal.EN_PROCESO,
        }),
        update: jest.fn(),
      };
      const managerTransaccion = {
        getRepository: jest.fn().mockReturnValue(repoTransaccion),
      };

      await service.actualizarEstadoPorSolicitud(
        'animal-1',
        EstadoAnimal.ADOPTADO,
        managerTransaccion as never,
      );

      expect(managerTransaccion.getRepository).toHaveBeenCalledWith(Animal);
      expect(repoTransaccion.update).toHaveBeenCalledWith('animal-1', {
        estado: EstadoAnimal.ADOPTADO,
      });
      expect(animalesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      animalesRepository.findOne.mockResolvedValue({ id: 'animal-1', fotos: [] });
    });

    it('lanza 409 si el animal tiene solicitudes y no borra', async () => {
      solicitudesRepository.count.mockResolvedValue(1);

      await expect(service.remove('animal-1')).rejects.toThrow(
        ConflictException,
      );
      expect(animalesRepository.delete).not.toHaveBeenCalled();
    });

    it('borra el animal si no tiene solicitudes', async () => {
      solicitudesRepository.count.mockResolvedValue(0);
      animalesRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove('animal-1')).resolves.toEqual({ deleted: 1 });
    });
  });
});