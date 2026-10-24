import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';

// Registra la entidad de notificaciones; con autoLoadEntities se añade a la conexión.
@Module({
  imports: [TypeOrmModule.forFeature([Notificacion])],
})
export class NotificacionesModule {}