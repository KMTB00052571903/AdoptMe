import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';

// Registra una línea por cada petición HTTP: método, ruta, código y duración.
// Ej.: [HTTP] GET /animales?ciudad=bogota 200 - 12ms
// Nunca registra el body: ahí pueden venir contraseñas u otros datos personales.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const inicio = Date.now();

    // 'finish' se dispara cuando la respuesta ya se envió, así el código
    // es el real (201 en un POST, 400/404/409 si hubo error).
    response.on('finish', () => {
      const duracion = Date.now() - inicio;
      const linea = `${request.method} ${request.originalUrl} ${response.statusCode} - ${duracion}ms`;

      if (response.statusCode >= 500) {
        this.logger.error(linea);
      } else if (response.statusCode >= 400) {
        this.logger.warn(linea);
      } else {
        this.logger.log(linea);
      }
    });

    return next.handle();
  }
}