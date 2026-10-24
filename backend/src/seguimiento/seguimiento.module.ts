import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkpoint } from './entities/checkpoint.entity';

// Registra la entidad de checkpoints; con autoLoadEntities se añade a la conexión.
@Module({
  imports: [TypeOrmModule.forFeature([Checkpoint])],
})
export class SeguimientoModule {}