import { describe, jest, beforeEach, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { SolicitudesService } from './adoption-requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SolicitudAdopcion } from './entities/adoption-request.entity';
import { AprobadoService } from './rules/request-approval.service';
import { RechazadoService } from './rules/request-rejection.service';
import { EstadoSolicitud } from '../common/enums/adoption-request-status.enum';
import { Adoptante } from '../users/entities/adopter.entity';
import { AnimalesService } from '../animals/animals.service';
import { DataSource } from 'typeorm';

describe('SolicitudesServiceTest', () => {
  let service: SolicitudesService;

  const repositoryMock = {
    create: jest.fn(),
    findOne: jest.fn<(options: any) => Promise<SolicitudAdopcion | null>>(),
    save: jest.fn(),
  };

  const aprobadoServiceMock = {
    ensureNotTaken: jest.fn(),
  };

  const rechazadoServiceMock = {
    ensureHasMotive: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SolicitudesService,
        {
          provide: getRepositoryToken(SolicitudAdopcion),
          useValue: repositoryMock,
        },
        {
          provide: AprobadoService,
          useValue: aprobadoServiceMock,
        },
        {
          provide: RechazadoService,
          useValue: rechazadoServiceMock,
        },
        {
          provide: getRepositoryToken(Adoptante),
          useValue: { findOneBy: jest.fn() },
        },
        {
          provide: AnimalesService,
          useValue: { actualizarEstadoPorSolicitud: jest.fn() },
        },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(SolicitudesService);
  });

  it('returns a request when the id exists', async () => {
    const requestMock = {
      id: '99',
      animalId: '123',
      adoptanteId: '7AB',
      motivacion: 'Quiero una mascota.',
      condicionesHogar: 'Apartamento en primer piso.',
      estado: EstadoSolicitud.PENDIENTE,
    } as SolicitudAdopcion;

    repositoryMock.findOne.mockResolvedValue(requestMock);

    const result = await service.findOne('99');

    expect(result).toEqual(requestMock);
    expect(repositoryMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '99' } }),
    );
  });
});
