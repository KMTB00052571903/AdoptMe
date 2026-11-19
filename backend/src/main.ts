import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Interceptor global: se aplica a todas las rutas de todos los módulos.
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Render asigna el puerto en PORT. '0.0.0.0' permite recibir peticiones
  // desde fuera del servidor (con localhost solo respondería a sí mismo).
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}
bootstrap();