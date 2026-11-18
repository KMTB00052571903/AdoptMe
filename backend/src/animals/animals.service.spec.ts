import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AnimalSpecies } from '../common/enums/animal-species.enum';
import { AnimalStatus } from '../common/enums/animal-status.enum';
import { AnimalSex } from '../common/enums/animal-sex.enum';
import { AnimalSize } from '../common/enums/animal-size.enum';
import { SolicitudAdopcion } from '../adoption-requests/entities/adoption-request.entity';
import { Fundacion } from '../users/entities/foundation.entity';
import { AnimalRulesService } from './animal-rules.service';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { FilterAnimalsDto } from './dto/filter-animals.dto';
import { Animal } from './entities/animal.entity';
import { HealthRecord } from './entities/health-record.entity';
import { AnimalPhoto } from './entities/animal-photo.entity';

describe('AnimalsService', () => {
  let service: AnimalsService;

  // Mocks: reemplazan a los repositorios y al DataSource reales.
  // Se crean de nuevo antes de cada prueba para que no se mezclen.
  let animalsRepository: Record<string, jest.Mock>;
  let foundationsRepository: Record<string, jest.Mock>;
  let requestsRepository: Record<string, jest.Mock>;
  let manager: Record<string, jest.Mock>;
  let dataSource: Record<string, jest.Mock>;

  const createDto: CreateAnimalDto = {
    nombre: 'Luna',
    especie: AnimalSpecies.DOG,
    sexo: AnimalSex.FEMALE,
    edadAproximadaMeses: 18,
    tamano: AnimalSize.MEDIUM,
    descripcion: 'Tranquila y cariñosa',
    fechaIngreso: '2026-09-15',
    fotos: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    fichaSalud: { vacunasAlDia: true, esterilizado: true },
  };

  beforeEach(async () => {
    animalsRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    foundationsRepository = { existsBy: jest.fn() };
    requestsRepository = { count: jest.fn() };

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
        AnimalsService,
        AnimalRulesService, // el real: no tiene dependencias
        { provide: getRepositoryToken(Animal), useValue: animalsRepository },
        {
          provide: getRepositoryToken(Fundacion),
          useValue: foundationsRepository,
        },
        {
          provide: getRepositoryToken(SolicitudAdopcion),
          useValue: requestsRepository,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get(AnimalsService);
  });

  describe('create', () => {
    it('lanza 404 si la fundación no existe y no abre la transacción', async () => {
      foundationsRepository.existsBy.mockResolvedValue(false);

      await expect(service.create(createDto, 'fundacion-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('guarda el animal, su ficha y las fotos en orden 1, 2...', async () => {
      foundationsRepository.existsBy.mockResolvedValue(true);
      animalsRepository.findOne.mockResolvedValue({ id: 'animal-1', fotos: [] });

      await service.create(createDto, 'fundacion-1');

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      // La fundación del animal es la del token, no una que venga en el body.
      expect(manager.create).toHaveBeenCalledWith(
        Animal,
        expect.objectContaining({ nombre: 'Luna', fundacionId: 'fundacion-1' }),
      );
      expect(manager.create).toHaveBeenCalledWith(HealthRecord, {
        vacunasAlDia: true,
        esterilizado: true,
        animalId: 'animal-1',
      });
      expect(manager.create).toHaveBeenCalledWith(AnimalPhoto, {
        animalId: 'animal-1',
        url: 'https://example.com/1.jpg',
        orden: 1,
      });
      expect(manager.create).toHaveBeenCalledWith(AnimalPhoto, {
        animalId: 'animal-1',
        url: 'https://example.com/2.jpg',
        orden: 2,
      });
    });
  });

  describe('findAll', () => {
    it('lanza 400 si edadMinMeses es mayor que edadMaxMeses', async () => {
      const filters = { edadMinMeses: 24, edadMaxMeses: 12, page: 1, limit: 10 };

      await expect(
        service.findAll(filters as FilterAnimalsDto),
      ).rejects.toThrow(BadRequestException);
      expect(animalsRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('calcula skip y take según la página', async () => {
      animalsRepository.findAndCount.mockResolvedValue([[], 0]);

      const resultado = await service.findAll({
        page: 3,
        limit: 10,
      } as FilterAnimalsDto);

      expect(animalsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(resultado).toEqual({ data: [], total: 0, page: 3, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('lanza 404 si el animal no existe', async () => {
      animalsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve las fotos ordenadas, con la principal primero', async () => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        fotos: [{ orden: 2 }, { orden: 1 }],
      });

      const animal = await service.findOne('animal-1');

      expect(animal.fotos.map((foto) => foto.orden)).toEqual([1, 2]);
    });
  });

  describe('update', () => {
    it('no toca la base si el PATCH llega vacío', async () => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        fundacionId: 'fundacion-1',
        fotos: [],
      });

      await service.update('animal-1', {}, 'fundacion-1');

      expect(animalsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('changeStatus', () => {
    it('lanza 409 al intentar poner adoptado a mano y no actualiza', async () => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        fundacionId: 'fundacion-1',
        estado: AnimalStatus.AVAILABLE,
        fotos: [],
      });

      await expect(
        service.changeStatus(
          'animal-1',
          { estado: AnimalStatus.ADOPTED },
          'fundacion-1',
        ),
      ).rejects.toThrow(ConflictException);
      expect(animalsRepository.update).not.toHaveBeenCalled();
    });

    it('actualiza el estado cuando la transición está permitida', async () => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        fundacionId: 'fundacion-1',
        estado: AnimalStatus.AVAILABLE,
        fotos: [],
      });

      await service.changeStatus(
        'animal-1',
        { estado: AnimalStatus.UNAVAILABLE },
        'fundacion-1',
      );

      expect(animalsRepository.update).toHaveBeenCalledWith('animal-1', {
        estado: AnimalStatus.UNAVAILABLE,
      });
    });
  });

  describe('solo la fundación dueña modifica el animal', () => {
    // El animal es de fundacion-1; la petición la hace fundacion-2.
    beforeEach(() => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        fundacionId: 'fundacion-1',
        estado: AnimalStatus.AVAILABLE,
        fotos: [],
      });
    });

    it('update: lanza 403 si el animal es de otra fundación y no actualiza', async () => {
      await expect(
        service.update('animal-1', { nombre: 'Otro' }, 'fundacion-2'),
      ).rejects.toThrow(ForbiddenException);
      expect(animalsRepository.update).not.toHaveBeenCalled();
    });

    it('update: actualiza si el animal es de la misma fundación', async () => {
      await service.update('animal-1', { nombre: 'Otro' }, 'fundacion-1');

      expect(animalsRepository.update).toHaveBeenCalledWith('animal-1', {
        nombre: 'Otro',
      });
    });

    it('changeStatus: lanza 403 si el animal es de otra fundación', async () => {
      await expect(
        service.changeStatus(
          'animal-1',
          { estado: AnimalStatus.UNAVAILABLE },
          'fundacion-2',
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(animalsRepository.update).not.toHaveBeenCalled();
    });

    it('remove: lanza 403 si el animal es de otra fundación y no borra', async () => {
      await expect(service.remove('animal-1', 'fundacion-2')).rejects.toThrow(
        ForbiddenException,
      );
      expect(requestsRepository.count).not.toHaveBeenCalled();
      expect(animalsRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateStatusFromRequest', () => {
    it('pasa el animal a en_proceso cuando llega la primera solicitud', async () => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        estado: AnimalStatus.AVAILABLE,
      });

      await service.updateStatusFromRequest(
        'animal-1',
        AnimalStatus.IN_PROCESS,
      );

      expect(animalsRepository.update).toHaveBeenCalledWith('animal-1', {
        estado: AnimalStatus.IN_PROCESS,
      });
    });

    it('no actualiza si el estado ya es el mismo', async () => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        estado: AnimalStatus.IN_PROCESS,
      });

      await service.updateStatusFromRequest(
        'animal-1',
        AnimalStatus.IN_PROCESS,
      );

      expect(animalsRepository.update).not.toHaveBeenCalled();
    });

    it('lanza 409 si el animal no está recibiendo solicitudes', async () => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        estado: AnimalStatus.UNAVAILABLE,
      });

      await expect(
        service.updateStatusFromRequest('animal-1', AnimalStatus.IN_PROCESS),
      ).rejects.toThrow(ConflictException);
      expect(animalsRepository.update).not.toHaveBeenCalled();
    });

    it('usa el repository del manager cuando recibe una transacción', async () => {
      const transactionRepository = {
        findOne: jest.fn().mockResolvedValue({
          id: 'animal-1',
          estado: AnimalStatus.IN_PROCESS,
        }),
        update: jest.fn(),
      };
      const transactionManager = {
        getRepository: jest.fn().mockReturnValue(transactionRepository),
      };

      await service.updateStatusFromRequest(
        'animal-1',
        AnimalStatus.ADOPTED,
        transactionManager as never,
      );

      expect(transactionManager.getRepository).toHaveBeenCalledWith(Animal);
      expect(transactionRepository.update).toHaveBeenCalledWith('animal-1', {
        estado: AnimalStatus.ADOPTED,
      });
      expect(animalsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      animalsRepository.findOne.mockResolvedValue({
        id: 'animal-1',
        fundacionId: 'fundacion-1',
        fotos: [],
      });
    });

    it('lanza 409 si el animal tiene solicitudes y no borra', async () => {
      requestsRepository.count.mockResolvedValue(1);

      await expect(service.remove('animal-1', 'fundacion-1')).rejects.toThrow(
        ConflictException,
      );
      expect(animalsRepository.delete).not.toHaveBeenCalled();
    });

    it('borra el animal si no tiene solicitudes', async () => {
      requestsRepository.count.mockResolvedValue(0);
      animalsRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(
        service.remove('animal-1', 'fundacion-1'),
      ).resolves.toEqual({ deleted: 1 });
    });
  });
});