import { ConflictException, Injectable } from '@nestjs/common';
import { EstadoAnimal } from '../common/enums/estado-animal.enum';

// Reglas de negocio de F1. No usa base de datos ni HTTP: solo decide si una
// acción está permitida. Si no lo está, lanza 409 (Conflict).
@Injectable()
export class AnimalRulesService {
  // Cambio de estado manual (PATCH /animales/:id/estado).
  // La fundación solo puede alternar entre 'disponible' y 'no_disponible'.
  // 'en_proceso' y 'adoptado' solo los pone el flujo de solicitudes (F2).
  assertCambioEstadoManual(actual: EstadoAnimal, nuevo: EstadoAnimal): void {
    if (nuevo === EstadoAnimal.EN_PROCESO || nuevo === EstadoAnimal.ADOPTADO) {
      throw new ConflictException(
        `El estado '${nuevo}' solo cambia a través de las solicitudes de adopción`,
      );
    }

    if (actual === EstadoAnimal.ADOPTADO) {
      throw new ConflictException('El animal ya fue adoptado');
    }

    if (actual === EstadoAnimal.EN_PROCESO) {
      throw new ConflictException(
        'El animal tiene solicitudes pendientes; primero hay que resolverlas',
      );
    }

    if (actual === nuevo) {
      throw new ConflictException(`El animal ya está en estado '${actual}'`);
    }
  }

  // Eliminar (DELETE /animales/:id). Un animal con solicitudes no se borra,
  // para no perder el historial de adopciones. La base de datos también lo
  // impide con ON DELETE RESTRICT; esta regla da un mensaje claro antes.
  assertPuedeEliminar(cantidadSolicitudes: number): void {
    if (cantidadSolicitudes > 0) {
      throw new ConflictException(
        'No se puede eliminar un animal con solicitudes; márcalo como no_disponible',
      );
    }
  }
}