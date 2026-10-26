import { ConfigService } from '@nestjs/config';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let getOrThrow: jest.Mock;
  let config: ConfigService;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue('secreto-solo-para-pruebas');
    config = { getOrThrow } as unknown as ConfigService;
  });

  it('reads the signing secret from JWT_SECRET', () => {
    new JwtStrategy(config);

    expect(getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('cannot be created when JWT_SECRET is missing', () => {
    getOrThrow.mockImplementation(() => {
      throw new TypeError('Configuration key "JWT_SECRET" does not exist');
    });

    expect(() => new JwtStrategy(config)).toThrow('JWT_SECRET');
  });

  it('turns a foundation token into request.user with fundacionId', () => {
    const strategy = new JwtStrategy(config);

    const user = strategy.validate({
      sub: 'u-2',
      email: 'ana@huellitas.org',
      rol: RolUsuario.FUNDACION,
      fundacionId: 'f-1',
    });

    expect(user).toEqual({
      id: 'u-2',
      email: 'ana@huellitas.org',
      rol: RolUsuario.FUNDACION,
      fundacionId: 'f-1',
    });
  });

  it('turns an adopter token into request.user with adoptanteId', () => {
    const strategy = new JwtStrategy(config);

    const user = strategy.validate({
      sub: 'u-1',
      email: 'kami@mail.com',
      rol: RolUsuario.ADOPTANTE,
      adoptanteId: 'a-1',
    });

    expect(user).toEqual({
      id: 'u-1',
      email: 'kami@mail.com',
      rol: RolUsuario.ADOPTANTE,
      adoptanteId: 'a-1',
    });
    expect(user.fundacionId).toBeUndefined();
  });
});
