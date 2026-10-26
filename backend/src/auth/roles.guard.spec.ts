import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { ROLES_KEY, Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UsuarioAutenticado } from './usuario-autenticado.interface';

// Contexto simulado: lo mínimo que RolesGuard lee de una petición real.
function crearContexto(user?: UsuarioAutenticado): ExecutionContext {
  return {
    getHandler: () => 'handler',
    getClass: () => 'controlador',
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

const fundacion: UsuarioAutenticado = {
  id: 'u-2',
  email: 'ana@huellitas.org',
  rol: RolUsuario.FUNDACION,
  fundacionId: 'f-1',
};
const adoptante: UsuarioAutenticado = {
  id: 'u-1',
  email: 'kami@mail.com',
  rol: RolUsuario.ADOPTANTE,
  adoptanteId: 'a-1',
};

describe('Roles decorator', () => {
  it('stores the allowed roles as metadata', () => {
    @Roles(RolUsuario.FUNDACION)
    class ControladorDeEjemplo {}

    expect(new Reflector().get(ROLES_KEY, ControladorDeEjemplo)).toEqual([
      RolUsuario.FUNDACION,
    ]);
  });
});

describe('RolesGuard', () => {
  let getAllAndOverride: jest.Mock;
  let guard: RolesGuard;

  beforeEach(() => {
    getAllAndOverride = jest.fn();
    guard = new RolesGuard({ getAllAndOverride } as unknown as Reflector);
  });

  it('allows the request when the route has no @Roles', () => {
    getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(crearContexto(adoptante))).toBe(true);
  });

  it('reads @Roles from the method first and then from the controller', () => {
    getAllAndOverride.mockReturnValue(undefined);

    guard.canActivate(crearContexto(adoptante));

    expect(getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      'handler',
      'controlador',
    ]);
  });

  it('allows a user whose rol is in @Roles', () => {
    getAllAndOverride.mockReturnValue([RolUsuario.FUNDACION]);

    expect(guard.canActivate(crearContexto(fundacion))).toBe(true);
  });

  it('rejects with 403 a user whose rol is not in @Roles', () => {
    getAllAndOverride.mockReturnValue([RolUsuario.FUNDACION]);

    expect(() => guard.canActivate(crearContexto(adoptante))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects with 401 when there is no authenticated user', () => {
    getAllAndOverride.mockReturnValue([RolUsuario.FUNDACION]);

    expect(() => guard.canActivate(crearContexto(undefined))).toThrow(
      UnauthorizedException,
    );
  });
});
