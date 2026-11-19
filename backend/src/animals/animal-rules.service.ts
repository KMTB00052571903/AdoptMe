import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AnimalStatus } from '../common/enums/animal-status.enum';

// Cambios de estado que puede hacer el flujo de solicitudes (F2).
const REQUEST_TRANSITIONS: Record<AnimalStatus, AnimalStatus[]> = {
  // Llega la primera solicitud.
  [AnimalStatus.AVAILABLE]: [AnimalStatus.IN_PROCESS],
  // Llega otra solicitud (sigue en proceso), se aprueba una (adoptado)
  // o se rechazan todas y no queda ninguna pendiente (disponible).
  [AnimalStatus.IN_PROCESS]: [
    AnimalStatus.IN_PROCESS,
    AnimalStatus.ADOPTED,
    AnimalStatus.AVAILABLE,
  ],
  // Estos no reciben solicitudes.
  [AnimalStatus.ADOPTED]: [],
  [AnimalStatus.UNAVAILABLE]: [],
};

// Reglas de negocio de F1. No usa base de datos ni HTTP: solo decide si una
// acción está permitida. Si no lo está, lanza 409 (Conflict) o 403 (Forbidden).
@Injectable()
export class AnimalRulesService {
  // Una fundación solo puede editar, cambiar de estado o borrar SUS animales.
  // El guard de Auth revisa que sea una fundación; esta regla revisa que sea
  // la dueña de este animal en particular.
  assertBelongsToFoundation(
    animalFoundationId: string,
    userFoundationId: string,
  ): void {
    if (animalFoundationId !== userFoundationId) {
      throw new ForbiddenException('Este animal pertenece a otra fundación');
    }
  }

  // Cambio de estado manual (PATCH /animales/:id/estado).
  // La fundación solo puede alternar entre 'disponible' y 'no_disponible'.
  // 'en_proceso' y 'adoptado' solo los pone el flujo de solicitudes (F2).
  assertManualStatusChange(current: AnimalStatus, next: AnimalStatus): void {
    if (next === AnimalStatus.IN_PROCESS || next === AnimalStatus.ADOPTED) {
      throw new ConflictException(
        `El estado '${next}' solo cambia a través de las solicitudes de adopción`,
      );
    }

    if (current === AnimalStatus.ADOPTED) {
      throw new ConflictException('El animal ya fue adoptado');
    }

    if (current === AnimalStatus.IN_PROCESS) {
      throw new ConflictException(
        'El animal tiene solicitudes pendientes; primero hay que resolverlas',
      );
    }

    if (current === next) {
      throw new ConflictException(`El animal ya está en estado '${current}'`);
    }
  }

  // Cambio de estado desde Solicitudes (F2). No es un endpoint: lo llama
  // SolicitudesService al crear, aprobar o rechazar una solicitud.
  assertStatusChangeFromRequest(
    current: AnimalStatus,
    next: AnimalStatus,
  ): void {
    if (!REQUEST_TRANSITIONS[current].includes(next)) {
      if (
        current === AnimalStatus.ADOPTED ||
        current === AnimalStatus.UNAVAILABLE
      ) {
        throw new ConflictException(
          `El animal está '${current}' y no está recibiendo solicitudes`,
        );
      }
      throw new ConflictException(
        `No se puede pasar de '${current}' a '${next}' por una solicitud`,
      );
    }
  }

  // Eliminar (DELETE /animales/:id). Un animal con solicitudes no se borra,
  // para no perder el historial de adopciones. La base de datos también lo
  // impide con ON DELETE RESTRICT; esta regla da un mensaje claro antes.
  assertCanDelete(requestCount: number): void {
    if (requestCount > 0) {
      throw new ConflictException(
        'No se puede eliminar un animal con solicitudes; márcalo como no_disponible',
      );
    }
  }
}