import {
  Body,
  Post,
  Patch,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { SolicitudesService } from './adoption-requests.service';
import { CreateSolicitudDto } from './dto/create-adoption-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolUsuario } from 'src/common/enums/user-role.enum';

const requestValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADOPTANTE)
  create(@Body(requestValidationPipe) createSolicitudDto: CreateSolicitudDto) {
    return this.solicitudesService.create(createSolicitudDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudesService.findOne(id);
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.FUNDACION)
  markAproved(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudesService.aprove(id);
  }

  @Patch(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.FUNDACION)
  markDenied(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudesService.deny(id);
  }
}
