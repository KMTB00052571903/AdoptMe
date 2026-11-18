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
import type { RequestConUsuario } from '../auth/request-with-user.interface';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from '../common/enums/user-role.enum';
import { requestValidationPipe } from '../common/request-validation.pipe';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { FilterAnimalsDto } from './dto/filter-animals.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { UpdateAnimalStatusDto } from './dto/update-animal-status.dto';

// Los GET son públicos (catálogo). POST, PATCH y DELETE son solo para la
// fundación: primero JwtAuthGuard (401 sin token) y después RolesGuard
// (403 si el rol no es fundación). La fundación sale siempre del token.
@Controller('animales')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  // POST /animales -> 201
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.FUNDACION)
  create(
    @Body(requestValidationPipe) dto: CreateAnimalDto,
    @Req() req: RequestConUsuario,
  ) {
    return this.animalsService.create(dto, this.foundationIdFromToken(req));
  }

  // GET /animales?especie=perro&tamano=mediano&ciudad=Cali&page=1&limit=10
  @Get()
  findAll(@Query(requestValidationPipe) filters: FilterAnimalsDto) {
    return this.animalsService.findAll(filters);
  }

  // GET /animales/:id -> 400 si el id no es UUID, 404 si no existe
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalsService.findOne(id);
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
    return this.animalsService.update(id, dto, this.foundationIdFromToken(req));
  }

  // PATCH /animales/:id/estado -> 409 si la transición no está permitida
  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.FUNDACION)
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateAnimalStatusDto,
    @Req() req: RequestConUsuario,
  ) {
    return this.animalsService.changeStatus(
      id,
      dto,
      this.foundationIdFromToken(req),
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
    return this.animalsService.remove(id, this.foundationIdFromToken(req));
  }

  // En UsuarioAutenticado fundacionId es opcional (solo existe si el rol es
  // fundación). RolesGuard ya lo garantiza, pero si faltara se responde 403.
  private foundationIdFromToken(req: RequestConUsuario): string {
    const fundacionId = req.user.fundacionId;
    if (!fundacionId) {
      throw new ForbiddenException('El token no tiene una fundación asociada');
    }
    return fundacionId;
  }
}