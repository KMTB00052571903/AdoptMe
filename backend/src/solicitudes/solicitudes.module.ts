import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAdopcion } from './entities/solicitud-adopcion.entity';

// Registra la entidad de solicitudes; con autoLoadEntities se añade a la conexión.
@Module({
  imports: [TypeOrmModule.forFeature([SolicitudAdopcion])],
})
export class SolicitudesModule {}
