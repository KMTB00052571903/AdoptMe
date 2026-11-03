import { ConflictException, Injectable } from '@nestjs/common';
import { SolicitudAdopcion } from '../entities/adoption-request.entity';
import { EstadoSolicitud } from '../../common/enums/adoption-request-status.enum';

@Injectable()
export class AprobadoService {
  ensureNotTaken(request: SolicitudAdopcion): void {
    if (request.estado === EstadoSolicitud.APROBADA) {
      request.estado = EstadoSolicitud.CERRADA_POR_OTRA_ADOPCION;
      throw new ConflictException('Animal ya aprobado');
    }
  }
}
