import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { RequestConUsuario } from './request-con-usuario.interface';
import { ROLES_KEY } from './roles.decorator';

// Portero de autorización. Va DESPUÉS de JwtAuthGuard, que deja request.user:
// @UseGuards(JwtAuthGuard, RolesGuard)
// Sin @Roles en la ruta deja pasar; con @Roles y otro rol responde 403.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca @Roles primero en el método y después en el controlador.
    const rolesPermitidos = this.reflector.getAllAndOverride<
      RolUsuario[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestConUsuario>();
    // Sin usuario no se sabe quién es: falta JwtAuthGuard antes de este guard.
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!rolesPermitidos.includes(user.rol)) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }
    return true;
  }
}
