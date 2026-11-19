import { RolUsuario } from '../common/enums/user-role.enum';

// Datos de un usuario que se pueden devolver en una respuesta HTTP.
// Nunca incluye passwordHash.
export interface UsuarioPublico {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}
