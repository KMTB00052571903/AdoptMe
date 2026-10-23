import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Fundacion } from './entities/fundacion.entity';
import { Adoptante } from './entities/adoptante.entity';

// Registra las entidades de usuarios; con autoLoadEntities se añaden a la conexión.
@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Fundacion, Adoptante])],
})
export class UsuariosModule {}
