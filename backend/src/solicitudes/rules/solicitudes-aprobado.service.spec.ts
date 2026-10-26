import { AprobadoService } from './solicitudes-aprobado.service';
import { describe, it, expect } from '@jest/globals';
import { EstadoSolicitud } from 'src/common/enums/estado-solicitud.enum';
import { SolicitudAdopcion } from '../entities/solicitud-adopcion.entity';
import { ConflictException } from '@nestjs/common';
import { beforeEach } from 'node:test';

describe('SolicitudesAprobadoTest', () => {
  let service = new AprobadoService();

  beforeEach(() => {
    service = new AprobadoService();
  });

  it('cannot aprove a pre-aproved request', () => {
    const mockRequest = {
      estado: EstadoSolicitud.APROBADA,
    } as SolicitudAdopcion;

    expect(() => service.ensureNotTaken(mockRequest)).toThrow(
      ConflictException,
    );
  });
});
