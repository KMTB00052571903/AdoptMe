import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAdopcion } from './entities/adoption-request.entity';
import { SolicitudesController } from './adoption-requests.controller';
import { SolicitudesService } from './adoption-requests.service';
import { AprobadoService } from './rules/request-approval.service';
import { RechazadoService } from './rules/request-rejection.service';
import { AnimalesModule } from '../animals/animals.module';
import { Adoptante } from '../users/entities/adopter.entity';

// Registra la entidad de solicitudes; con autoLoadEntities se añade a la conexión.
@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudAdopcion, Adoptante]),
    AnimalesModule,
  ],
  providers: [SolicitudesService, AprobadoService, RechazadoService],
  controllers: [SolicitudesController],
})
export class SolicitudesModule {}
