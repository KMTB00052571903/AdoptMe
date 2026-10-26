import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Portero de autenticación: @UseGuards(JwtAuthGuard).
// Sin token, con firma inválida o caducado -> 401.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
