import { describe, it, expect, beforeEach } from '@jest/globals';
import { EstadoSolicitud } from '../../common/enums/adoption-request-status.enum';
import { SolicitudAdopcion } from '../entities/adoption-request.entity';
import { BadRequestException } from '@nestjs/common';
import { RechazadoService } from './request-rejection.service';

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
