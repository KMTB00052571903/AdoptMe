import { ConflictException, Injectable } from '@nestjs/common';
import { Usuario } from '../usuarios/entities/usuario.entity';

// Reglas de Auth: deciden si una operación está permitida.
// No consultan ni guardan en la base de datos; reciben los datos ya buscados.
@Injectable()
export class AuthRulesService {
  ensureEmailDisponible(usuarioExistente: Usuario | null): void {
    if (usuarioExistente) {
      throw new ConflictException('El email ya está registrado');
    }
  }
}
