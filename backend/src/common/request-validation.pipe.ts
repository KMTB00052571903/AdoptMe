import { ValidationPipe } from '@nestjs/common';

// Pipe compartido: se aplica en cada endpoint con @Body(requestValidationPipe)
// o @Query(requestValidationPipe). Si el DTO no se cumple, responde 400.
export const requestValidationPipe = new ValidationPipe({
  whitelist: true, // solo deja pasar las propiedades que tienen decorador
  forbidNonWhitelisted: true, // y responde 400 si llega alguna que no lo tiene
  transform: true, // convierte el JSON en una instancia del DTO
});
