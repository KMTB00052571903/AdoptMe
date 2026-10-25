import { ConflictException, Injectable } from '@nestjs/common';
import { SolicitudAdopcion } from '../entities/solicitud-adopcion.entity';
import { EstadoSolicitud } from 'src/common/enums/estado-solicitud.enum';

@Injectable()
export class AprobadoService {
  ensureNotTaken(request: SolicitudAdopcion): void {
    if (request.estado === EstadoSolicitud.APROBADA) {
      request.estado = EstadoSolicitud.CERRADA_POR_OTRA_ADOPCION;
      throw new ConflictException('Animal ya aprobado');
    }
  }
}
