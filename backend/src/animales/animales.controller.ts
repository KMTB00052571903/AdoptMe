import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AnimalesService } from './animales.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { FilterAnimalesDto } from './dto/filter-animales.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { UpdateEstadoAnimalDto } from './dto/update-estado-animal.dto';

// Mismo patrón de clase: el pipe se aplica en cada @Body/@Query, no global.
// transform: entrega una instancia del DTO (y aplica @Type y los valores por defecto).
// whitelist: solo deja pasar los campos con decoradores.
// forbidNonWhitelisted: responde 400 si llegan campos extra.
const requestValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

// TODO (cuando Kami suba Auth): agregar @UseGuards(JwtAuthGuard) y roles.
// POST, PATCH y DELETE serán solo para la fundación; los GET, públicos.
@Controller('animales')
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

  // POST /animales -> 201
  @Post()
  create(@Body(requestValidationPipe) dto: CreateAnimalDto) {
    return this.animalesService.create(dto);
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

  // PATCH /animales/:id -> actualización parcial
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateAnimalDto,
  ) {
    return this.animalesService.update(id, dto);
  }

  // PATCH /animales/:id/estado -> 409 si la transición no está permitida
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateEstadoAnimalDto,
  ) {
    return this.animalesService.cambiarEstado(id, dto);
  }

  // DELETE /animales/:id -> 409 si tiene solicitudes
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalesService.remove(id);
  }
}