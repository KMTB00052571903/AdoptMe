import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthController } from './auth.controller';
import { AuthRulesService } from './auth-rules.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

// Conecta las piezas de Auth. Solo pide el repositorio de Usuario: los perfiles
// (Adoptante y Fundacion) se guardan con el manager de la transacción.
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PassportModule,
    // El secreto se lee del .env con ConfigService; nunca se escribe en el código.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Sin JWT_SECRET la app no arranca: nunca se firma con un secreto vacío.
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  // JwtStrategy se registra aquí una vez; después cualquier módulo puede usar
  // @UseGuards(JwtAuthGuard) sin importar AuthModule.
  providers: [AuthService, AuthRulesService, JwtStrategy],
})
export class AuthModule {}
