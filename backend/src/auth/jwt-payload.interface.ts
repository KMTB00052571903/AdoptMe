import { RolUsuario } from '../common/enums/rol-usuario.enum';

// Datos (claims) que viajan dentro del JWT. Cualquiera puede leerlos:
// nunca incluir contraseñas, hashes ni otros secretos.
export interface JwtPayload {
  sub: string; // id del usuario
  email: string;
  rol: RolUsuario;
  // id del perfil según el rol: una fundación solo trae fundacionId
  // y un adoptante solo adoptanteId. Salen de la base de datos al hacer login.
  fundacionId?: string;
  adoptanteId?: string;
}
