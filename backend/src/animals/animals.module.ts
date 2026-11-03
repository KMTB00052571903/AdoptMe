import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAdopcion } from '../adoption-requests/entities/adoption-request.entity';
import { Fundacion } from '../users/entities/foundation.entity';
import { AnimalRulesService } from './animal-rules.service';
import { AnimalesService } from './animals.service';
import { Animal } from './entities/animal.entity';
import { FichaSalud } from './entities/health-record.entity';
import { FotoAnimal } from './entities/animal-photo.entity';
import { AnimalesController } from './animals.controller';

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