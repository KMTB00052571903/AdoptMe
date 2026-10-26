import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAdopcion } from './entities/solicitud-adopcion.entity';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';
import { AprobadoService } from './rules/solicitudes-aprobado.service';
import { RechazadoService } from './rules/solicitudes-rechazado.service';

// Registra la entidad de solicitudes; con autoLoadEntities se añade a la conexión.
@Module({
  imports: [TypeOrmModule.forFeature([SolicitudAdopcion])],
  providers: [SolicitudesService, AprobadoService, RechazadoService],
  controllers: [SolicitudesController],
})
export class SolicitudesModule {}
