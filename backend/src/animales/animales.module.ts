import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAdopcion } from '../solicitudes/entities/solicitud-adopcion.entity';
import { Fundacion } from '../usuarios/entities/fundacion.entity';
import { AnimalRulesService } from './animal-rules.service';
import { AnimalesService } from './animales.service';
import { Animal } from './entities/animal.entity';
import { FichaSalud } from './entities/ficha-salud.entity';
import { FotoAnimal } from './entities/foto-animal.entity';
import { AnimalesController } from './animales.controller';

// forFeature registra los repositorios que este módulo puede inyectar.
// Fundacion y SolicitudAdopcion se usan para validar y contar.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Animal,
      FotoAnimal,
      FichaSalud,
      Fundacion,
      SolicitudAdopcion,
    ]),
  ],
  controllers: [AnimalesController],
  providers: [AnimalesService, AnimalRulesService],
  exports: [AnimalesService],
})
export class AnimalesModule {}