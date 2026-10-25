import { Body, Controller, Post } from '@nestjs/common';
import { requestValidationPipe } from '../common/request-validation.pipe';
import { AuthService } from './auth.service';
import { RegistroAdoptanteDto } from './dto/registro-adoptante.dto';
import { RegistroFundacionDto } from './dto/registro-fundacion.dto';

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
}
