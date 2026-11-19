import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/user.entity';
import { Fundacion } from './entities/foundation.entity';
import { Adoptante } from './entities/adopter.entity';

// Registra las entidades de usuarios; con autoLoadEntities se añaden a la conexión.
@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Fundacion, Adoptante])],
})
export class UsuariosModule {}
