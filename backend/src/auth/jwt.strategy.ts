import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UsuarioAutenticado } from './usuario-autenticado.interface';

// Enseña a Passport a reconocer nuestros tokens: los lee de
// "Authorization: Bearer <token>" y comprueba firma y caducidad con JWT_SECRET.
// Si algo falla, JwtAuthGuard responde 401 y validate() no se ejecuta.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  // Lo que devuelve este método queda en request.user.
  validate(payload: JwtPayload): UsuarioAutenticado {
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
      fundacionId: payload.fundacionId,
      adoptanteId: payload.adoptanteId,
    };
  }
}
