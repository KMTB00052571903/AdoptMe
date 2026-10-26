import { BadRequestException, Injectable } from '@nestjs/common';
import { SolicitudAdopcion } from '../entities/solicitud-adopcion.entity';

@Injectable()
export class RechazadoService {
  ensureHasMotive(request: SolicitudAdopcion): void {
    if (!request.motivoRechazo) {
      throw new BadRequestException('Falta de motivo');
    }
  }
}
