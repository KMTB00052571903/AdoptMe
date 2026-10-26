import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkpoint } from './entities/checkpoint.entity';
import { SeguimientoController } from './seguimiento.controller';
import { SeguimientoRulesService } from './seguimiento-rules.service';
import { SeguimientoService } from './seguimiento.service';

// Registra la entidad de checkpoints; con autoLoadEntities se añade a la conexión.
// Exporta SeguimientoService para que Solicitudes cree los checkpoints al aprobar.
@Module({
  imports: [TypeOrmModule.forFeature([Checkpoint])],
  controllers: [SeguimientoController],
  providers: [SeguimientoService, SeguimientoRulesService],
  exports: [SeguimientoService],
})
export class SeguimientoModule {}
