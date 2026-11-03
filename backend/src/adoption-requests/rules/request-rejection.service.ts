import { BadRequestException, Injectable } from '@nestjs/common';
import { SolicitudAdopcion } from '../entities/adoption-request.entity';

@Injectable()
export class RechazadoService {
  ensureHasMotive(request: SolicitudAdopcion): void {
    if (!request.motivoRechazo) {
      throw new BadRequestException('Falta de motivo');
    }
  }
}
