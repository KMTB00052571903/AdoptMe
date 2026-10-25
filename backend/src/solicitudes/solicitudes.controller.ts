import {
  Body,
  Post,
  Patch,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';

const requestValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  create(@Body(requestValidationPipe) createSolicitudDto: CreateSolicitudDto) {
    return this.solicitudesService.create(createSolicitudDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudesService.findOne(id);
  }

  @Patch(':id/aprobar')
  markAproved(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudesService.aprove(id);
  }

  @Patch(':id/rechazar')
  markDenied(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudesService.deny(id);
  }
}
