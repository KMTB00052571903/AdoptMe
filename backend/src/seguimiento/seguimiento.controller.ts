import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestConUsuario } from '../auth/request-con-usuario.interface';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { requestValidationPipe } from '../common/request-validation.pipe';
import { ResponderCheckpointDto } from './dto/responder-checkpoint.dto';
import { SeguimientoService } from './seguimiento.service';

// Todas las rutas son del adoptante autenticado: primero JwtAuthGuard (401)
// y después RolesGuard (403). El dueño sale siempre del token.
@Controller('seguimiento')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADOPTANTE)
export class SeguimientoController {
  constructor(private readonly seguimientoService: SeguimientoService) {}

  @Get('mis-checkpoints')
  listarMisCheckpoints(@Req() req: RequestConUsuario) {
    return this.seguimientoService.listarMisCheckpoints(req.user.adoptanteId);
  }

  // ParseUUIDPipe: si :id no tiene formato UUID responde 400 antes del servicio.
  @Patch('checkpoints/:id/responder')
  responder(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConUsuario,
    @Body(requestValidationPipe) dto: ResponderCheckpointDto,
  ) {
    return this.seguimientoService.responder(id, req.user.adoptanteId, dto);
  }
}
