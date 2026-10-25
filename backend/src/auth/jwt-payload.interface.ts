import { RolUsuario } from '../common/enums/rol-usuario.enum';

// Datos (claims) que viajan dentro del JWT. Cualquiera puede leerlos:
// nunca incluir contraseñas, hashes ni otros secretos.
export interface JwtPayload {
  sub: string; // id del usuario
  email: string;
  rol: RolUsuario;
}
