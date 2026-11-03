import { Request } from 'express';
import { UsuarioAutenticado } from './authenticated-user.interface';

// Tipo de la petición en rutas protegidas con JwtAuthGuard:
// @Req() req: RequestConUsuario  ->  req.user.fundacionId
export interface RequestConUsuario extends Request {
  user: UsuarioAutenticado;
}
