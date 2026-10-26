import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { requestValidationPipe } from '../common/request-validation.pipe';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroAdoptanteDto } from './dto/registro-adoptante.dto';
import { RegistroFundacionDto } from './dto/registro-fundacion.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { RequestConUsuario } from './request-con-usuario.interface';
import type { UsuarioAutenticado } from './usuario-autenticado.interface';

// Rutas de autenticación. Valida el body con el pipe compartido y delega
// en AuthService; no contiene reglas de negocio ni consultas.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // El rol lo decide la ruta, no el body.
  @Post('registro/adoptante')
  registrarAdoptante(@Body(requestValidationPipe) dto: RegistroAdoptanteDto) {
    return this.authService.registrarAdoptante(dto);
  }

  @Post('registro/fundacion')
  registrarFundacion(@Body(requestValidationPipe) dto: RegistroFundacionDto) {
    return this.authService.registrarFundacion(dto);
  }

  // Un POST responde 201 por defecto; el login no crea nada, así que responde 200.
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(requestValidationPipe) dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Ruta protegida: devuelve la identidad que JwtStrategy dejó en request.user.
  // Sirve para comprobar un token y como ejemplo para el resto del equipo.
  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  perfil(@Req() req: RequestConUsuario): UsuarioAutenticado {
    return req.user;
  }
}
