import { describe, it, expect } from '@jest/globals';
import { EstadoSolicitud } from 'src/common/enums/estado-solicitud.enum';
import { SolicitudAdopcion } from '../entities/solicitud-adopcion.entity';
import { BadRequestException } from '@nestjs/common';
import { beforeEach } from 'node:test';
import { RechazadoService } from './solicitudes-rechazado.service';

describe('SolicitudesRechazadoTest', () => {
  let service = new RechazadoService();

  beforeEach(() => {
    service = new RechazadoService();
  });

  it('cannot deny without motive', () => {
    const mockRequest = {
      estado: EstadoSolicitud.RECHAZADA,
    } as SolicitudAdopcion;

    expect(() => service.ensureHasMotive(mockRequest)).toThrow(
      BadRequestException,
    );
  });
});
