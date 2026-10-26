import { ConflictException } from '@nestjs/common';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthRulesService } from './auth-rules.service';

describe('AuthRulesService', () => {
  let service: AuthRulesService;

  beforeEach(() => {
    service = new AuthRulesService();
  });

  it('rejects an email that is already registered', () => {
    const existente = { id: 'u-1', email: 'kami@mail.com' } as Usuario;

    expect(() => service.ensureEmailDisponible(existente)).toThrow(
      ConflictException,
    );
  });

  it('allows an email that is not registered', () => {
    expect(() => service.ensureEmailDisponible(null)).not.toThrow();
  });
});
