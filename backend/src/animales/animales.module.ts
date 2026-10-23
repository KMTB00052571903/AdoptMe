import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Animal } from './entities/animal.entity';
import { FotoAnimal } from './entities/foto-animal.entity';
import { FichaSalud } from './entities/ficha-salud.entity';

// Registra las entidades de animales; con autoLoadEntities se añaden a la conexión.
@Module({
  imports: [TypeOrmModule.forFeature([Animal, FotoAnimal, FichaSalud])],
})
export class AnimalesModule {}
