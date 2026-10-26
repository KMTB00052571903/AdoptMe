import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AnimalesModule } from './animales/animales.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { SeguimientoModule } from './seguimiento/seguimiento.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Lee el .env de la raíz del repositorio (los comandos se ejecutan desde backend/)
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false, // las tablas solo cambian con migraciones (src/database)
      }),
    }),
    UsuariosModule,
    AnimalesModule,
    SolicitudesModule,
    SeguimientoModule,
    NotificacionesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
