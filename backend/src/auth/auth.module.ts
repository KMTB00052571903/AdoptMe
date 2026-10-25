import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthController } from './auth.controller';
import { AuthRulesService } from './auth-rules.service';
import { AuthService } from './auth.service';

// Conecta las piezas de Auth. Solo pide el repositorio de Usuario: los perfiles
// (Adoptante y Fundacion) se guardan con el manager de la transacción.
@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [AuthController],
  providers: [AuthService, AuthRulesService],
})
export class AuthModule {}
