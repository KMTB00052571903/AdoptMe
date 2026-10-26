import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestConUsuario } from '../auth/request-con-usuario.interface';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { requestValidationPipe } from '../common/request-validation.pipe';
import { AnimalesService } from './animales.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { FilterAnimalesDto } from './dto/filter-animales.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { UpdateEstadoAnimalDto } from './dto/update-estado-animal.dto';

// Los GET son públicos (catálogo). POST, PATCH y DELETE son solo para la
// fundación: primero JwtAuthGuard (401 sin token) y después RolesGuard
// (403 si el rol no es fundación). La fundación sale siempre del token.
@Controller('animales')
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

  // POST /animales -> 201
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.FUNDACION)
  create(
    @Body(requestValidationPipe) dto: CreateAnimalDto,
    @Req() req: RequestConUsuario,
  ) {
    return this.animalesService.create(dto, this.fundacionDelToken(req));
  }

  // GET /animales?especie=perro&tamano=mediano&ciudad=Cali&page=1&limit=10
  @Get()
  findAll(@Query(requestValidationPipe) filtros: FilterAnimalesDto) {
    return this.animalesService.findAll(filtros);
  }

  // GET /animales/:id -> 400 si el id no es UUID, 404 si no existe
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalesService.findOne(id);
  }

  // PATCH /animales/:id -> actualización parcial (403 si es de otra fundación)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.FUNDACION)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateAnimalDto,
    @Req() req: RequestConUsuario,
  ) {
    return this.animalesService.update(id, dto, this.fundacionDelToken(req));
  }

  // PATCH /animales/:id/estado -> 409 si la transición no está permitida
  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.FUNDACION)
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateEstadoAnimalDto,
    @Req() req: RequestConUsuario,
  ) {
    return this.animalesService.cambiarEstado(
      id,
      dto,
      this.fundacionDelToken(req),
    );
  }

  // DELETE /animales/:id -> 409 si tiene solicitudes
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.FUNDACION)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConUsuario,
  ) {
    return this.animalesService.remove(id, this.fundacionDelToken(req));
  }

  // En UsuarioAutenticado fundacionId es opcional (solo existe si el rol es
  // fundación). RolesGuard ya lo garantiza, pero si faltara se responde 403.
  private fundacionDelToken(req: RequestConUsuario): string {
    const fundacionId = req.user.fundacionId;
    if (!fundacionId) {
      throw new ForbiddenException('El token no tiene una fundación asociada');
    }
    return fundacionId;
  }
}