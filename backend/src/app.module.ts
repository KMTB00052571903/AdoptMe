import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './users/users.module';
import { AnimalesModule } from './animals/animals.module';
import { SolicitudesModule } from './adoption-requests/adoption-requests.module';
import { SeguimientoModule } from './tracking/tracking.module';
import { NotificacionesModule } from './notifications/notifications.module';
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
        // Neon exige conexión segura (SSL). En local (Docker) no hace falta.
        ssl: config.get<string>('NODE_ENV') === 'production',
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
