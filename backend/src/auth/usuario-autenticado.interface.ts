import { RolUsuario } from '../common/enums/rol-usuario.enum';

// Lo que JwtStrategy deja en request.user después de validar el token.
// Es la identidad en la que pueden confiar los controladores de todo el equipo.
export interface UsuarioAutenticado {
  id: string; // id del usuario (el "sub" del token)
  email: string;
  rol: RolUsuario;
  fundacionId?: string; // solo si rol = fundacion
  adoptanteId?: string; // solo si rol = adoptante
}
