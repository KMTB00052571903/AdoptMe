import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { EstadoCheckpoint } from '../common/enums/estado-checkpoint.enum';
import { EstadoSolicitud } from '../common/enums/estado-solicitud.enum';
import { TipoCheckpoint } from '../common/enums/tipo-checkpoint.enum';
import { SolicitudAdopcion } from '../solicitudes/entities/solicitud-adopcion.entity';
import { Checkpoint } from './entities/checkpoint.entity';
import { SeguimientoRulesService } from './seguimiento-rules.service';
import { SeguimientoService } from './seguimiento.service';

// Fechas lejanas para no depender del día en que se ejecuten las pruebas.
const FECHA_PASADA = '2000-01-01';
const FECHA_FUTURA = '2999-12-31';

describe('SeguimientoService', () => {
  let service: SeguimientoService;
  let checkpointRepositoryMock: {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let managerMock: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    checkpointRepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      // save() devuelve lo mismo que recibe, como un guardado exitoso.
      save: jest.fn((datos: unknown) => Promise.resolve(datos)),
    };
    managerMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((_entidad: unknown, datos: object) => datos),
      save: jest.fn((_entidad: unknown, datos: unknown) =>
        Promise.resolve(datos),
      ),
    };

    // Las reglas son puras (sin base de datos), así que se usa la clase real.
    const moduleRef = await Test.createTestingModule({
      providers: [
        SeguimientoService,
        SeguimientoRulesService,
        {
          provide: getRepositoryToken(Checkpoint),
          useValue: checkpointRepositoryMock,
        },
      ],
    }).compile();
    service = moduleRef.get(SeguimientoService);
  });

  function manager(): EntityManager {
    return managerMock as unknown as EntityManager;
  }

  describe('crearCheckpointsDeAprobacion', () => {
    const aprobada = {
      id: 's-1',
      estado: EstadoSolicitud.APROBADA,
      fechaResolucion: new Date(2026, 9, 25, 12, 0),
    };

    it('creates dia_30 and dia_90 as pending, dated from the approval', async () => {
      // Arrange
      managerMock.findOne.mockResolvedValue(aprobada);
      managerMock.find.mockResolvedValue([]);

      // Act
      const result = await service.crearCheckpointsDeAprobacion(
        manager(),
        's-1',
      );

      // Assert
      expect(managerMock.findOne).toHaveBeenCalledWith(SolicitudAdopcion, {
        where: { id: 's-1' },
      });
      expect(managerMock.save).toHaveBeenCalledWith(Checkpoint, [
        {
          solicitudId: 's-1',
          tipo: TipoCheckpoint.DIA_30,
          fechaProgramada: '2026-11-24',
          estado: EstadoCheckpoint.PENDIENTE,
        },
        {
          solicitudId: 's-1',
          tipo: TipoCheckpoint.DIA_90,
          fechaProgramada: '2027-01-23',
          estado: EstadoCheckpoint.PENDIENTE,
        },
      ]);
      expect(result).toHaveLength(2);
    });

    it('does not duplicate checkpoints when both already exist', async () => {
      // Arrange
      const existentes = [
        { id: 'c-1', tipo: TipoCheckpoint.DIA_30 },
        { id: 'c-2', tipo: TipoCheckpoint.DIA_90 },
      ];
      managerMock.findOne.mockResolvedValue(aprobada);
      managerMock.find.mockResolvedValue(existentes);

      // Act
      const result = await service.crearCheckpointsDeAprobacion(
        manager(),
        's-1',
      );

      // Assert
      expect(managerMock.save).not.toHaveBeenCalled();
      expect(result).toEqual(existentes);
    });

    it('creates only the missing checkpoint', async () => {
      // Arrange
      managerMock.findOne.mockResolvedValue(aprobada);
      managerMock.find.mockResolvedValue([
        { id: 'c-1', tipo: TipoCheckpoint.DIA_30 },
      ]);

      // Act
      await service.crearCheckpointsDeAprobacion(manager(), 's-1');

      // Assert
      expect(managerMock.save).toHaveBeenCalledWith(Checkpoint, [
        expect.objectContaining({ tipo: TipoCheckpoint.DIA_90 }),
      ]);
    });

    it('rejects a request that does not exist with 404', async () => {
      managerMock.findOne.mockResolvedValue(null);

      await expect(
        service.crearCheckpointsDeAprobacion(manager(), 's-9'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(managerMock.save).not.toHaveBeenCalled();
    });

    it('rejects a request that is not approved with 409', async () => {
      managerMock.findOne.mockResolvedValue({
        ...aprobada,
        estado: EstadoSolicitud.PENDIENTE,
      });

      await expect(
        service.crearCheckpointsDeAprobacion(manager(), 's-1'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(managerMock.save).not.toHaveBeenCalled();
    });

    it('rejects an approved request without fechaResolucion with 409', async () => {
      managerMock.findOne.mockResolvedValue({
        ...aprobada,
        fechaResolucion: null,
      });

      await expect(
        service.crearCheckpointsDeAprobacion(manager(), 's-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('listarMisCheckpoints', () => {
    it('only queries the checkpoints of the authenticated adopter', async () => {
      // Arrange
      checkpointRepositoryMock.find.mockResolvedValue([]);

      // Act
      await service.listarMisCheckpoints('a-1');

      // Assert
      expect(checkpointRepositoryMock.find).toHaveBeenCalledWith({
        where: { solicitud: { adoptanteId: 'a-1' } },
        order: { fechaProgramada: 'ASC' },
      });
    });

    it('marks overdue pending checkpoints as vencido and saves only those', async () => {
      // Arrange
      const atrasado = {
        id: 'c-1',
        estado: EstadoCheckpoint.PENDIENTE,
        fechaProgramada: FECHA_PASADA,
      };
      const aTiempo = {
        id: 'c-2',
        estado: EstadoCheckpoint.PENDIENTE,
        fechaProgramada: FECHA_FUTURA,
      };
      checkpointRepositoryMock.find.mockResolvedValue([atrasado, aTiempo]);

      // Act
      const result = await service.listarMisCheckpoints('a-1');

      // Assert
      expect(checkpointRepositoryMock.save).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'c-1',
          estado: EstadoCheckpoint.VENCIDO,
        }),
      ]);
      expect(result.map((c) => c.estado)).toEqual([
        EstadoCheckpoint.VENCIDO,
        EstadoCheckpoint.PENDIENTE,
      ]);
    });

    it('rejects a token without adoptanteId instead of listing everyone (403)', async () => {
      await expect(
        service.listarMisCheckpoints(undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(checkpointRepositoryMock.find).not.toHaveBeenCalled();
    });
  });

  describe('responder', () => {
    const respuesta = {
      comentario: 'Luna está feliz.',
      fotoUrl: 'https://ejemplo.com/luna.jpg',
    };

    it('saves the answer, fechaRespuesta and estado respondido', async () => {
      // Arrange
      checkpointRepositoryMock.findOne.mockResolvedValue({
        id: 'c-1',
        estado: EstadoCheckpoint.PENDIENTE,
        fechaProgramada: FECHA_FUTURA,
      });

      // Act
      const result = await service.responder('c-1', 'a-1', respuesta);

      // Assert
      expect(checkpointRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'c-1', solicitud: { adoptanteId: 'a-1' } },
      });
      expect(result).toEqual(
        expect.objectContaining({
          comentario: 'Luna está feliz.',
          fotoUrl: 'https://ejemplo.com/luna.jpg',
          estado: EstadoCheckpoint.RESPONDIDO,
        }),
      );
      expect(result.fechaRespuesta).toBeInstanceOf(Date);
    });

    it('stores fotoUrl as null when no photo is sent', async () => {
      checkpointRepositoryMock.findOne.mockResolvedValue({
        id: 'c-1',
        estado: EstadoCheckpoint.PENDIENTE,
        fechaProgramada: FECHA_FUTURA,
      });

      const result = await service.responder('c-1', 'a-1', {
        comentario: 'Todo bien.',
      });

      expect(result.fotoUrl).toBeNull();
    });

    it('answers 404 for a checkpoint that does not exist or belongs to someone else', async () => {
      checkpointRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.responder('c-ajeno', 'a-1', respuesta),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(checkpointRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('rejects answering twice with 409 and does not save', async () => {
      checkpointRepositoryMock.findOne.mockResolvedValue({
        id: 'c-1',
        estado: EstadoCheckpoint.RESPONDIDO,
        fechaProgramada: FECHA_PASADA,
        comentario: 'Primera respuesta',
      });

      await expect(
        service.responder('c-1', 'a-1', respuesta),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(checkpointRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('saves an overdue checkpoint as vencido and then rejects the answer with 409', async () => {
      const atrasado: Partial<Checkpoint> = {
        id: 'c-1',
        estado: EstadoCheckpoint.PENDIENTE,
        fechaProgramada: FECHA_PASADA,
      };
      checkpointRepositoryMock.findOne.mockResolvedValue(atrasado);

      await expect(
        service.responder('c-1', 'a-1', respuesta),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(checkpointRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(atrasado.estado).toBe(EstadoCheckpoint.VENCIDO);
      expect(atrasado.comentario).toBeUndefined();
    });

    it('rejects a token without adoptanteId with 403', async () => {
      await expect(
        service.responder('c-1', undefined, respuesta),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(checkpointRepositoryMock.findOne).not.toHaveBeenCalled();
    });
  });
});
