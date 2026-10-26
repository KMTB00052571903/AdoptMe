import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../common/enums/rol-usuario.enum';

export const ROLES_KEY = 'roles';

// Marca qué roles pueden usar una ruta (o todo un controlador).
// Se usa junto con RolesGuard: @UseGuards(JwtAuthGuard, RolesGuard).
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
