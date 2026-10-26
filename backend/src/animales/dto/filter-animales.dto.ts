import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EspecieAnimal } from '../../common/enums/especie-animal.enum';
import { TamanoAnimal } from '../../common/enums/tamano-animal.enum';

// Query del catálogo: GET /animales?especie=perro&tamano=mediano&page=1&limit=10
// Todo llega por la URL como texto; @Type(() => Number) convierte los números.
export class FilterAnimalesDto {
  @IsOptional()
  @IsEnum(EspecieAnimal)
  especie?: EspecieAnimal;

  @IsOptional()
  @IsEnum(TamanoAnimal)
  tamano?: TamanoAnimal;

  // Ciudad de la fundación (HU02).
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ciudad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(300)
  edadMinMeses?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(300)
  edadMaxMeses?: number;

  // Paginación (RNF04). Si no vienen, se usan los valores por defecto.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}