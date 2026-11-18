import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAdopcion } from '../adoption-requests/entities/adoption-request.entity';
import { Fundacion } from '../users/entities/foundation.entity';
import { AnimalRulesService } from './animal-rules.service';
import { AnimalsService } from './animals.service';
import { Animal } from './entities/animal.entity';
import { HealthRecord } from './entities/health-record.entity';
import { AnimalPhoto } from './entities/animal-photo.entity';
import { AnimalsController } from './animals.controller';

// forFeature registra los repositorios que este módulo puede inyectar.
// Fundacion y SolicitudAdopcion se usan para validar y contar.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Animal,
      AnimalPhoto,
      HealthRecord,
      Fundacion,
      SolicitudAdopcion,
    ]),
  ],
  controllers: [AnimalsController],
  providers: [AnimalsService, AnimalRulesService],
  exports: [AnimalsService],
})
export class AnimalsModule {}