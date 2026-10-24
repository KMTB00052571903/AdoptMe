import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EspecieAnimal } from '../../common/enums/especie-animal.enum';
import { SexoAnimal } from '../../common/enums/sexo-animal.enum';
import { TamanoAnimal } from '../../common/enums/tamano-animal.enum';

// PATCH: actualización parcial. Todo es opcional, pero si un campo viene,
// debe cumplir las mismas reglas que al crear.
// No incluye fundacionId ni estado: el estado tiene su propio endpoint.
export class UpdateAnimalDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre?: string;

  @IsOptional()
  @IsEnum(EspecieAnimal)
  especie?: EspecieAnimal;

  @IsOptional()
  @IsEnum(SexoAnimal)
  sexo?: SexoAnimal;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  razaAproximada?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(300)
  edadAproximadaMeses?: number;

  @IsOptional()
  @IsEnum(TamanoAnimal)
  tamano?: TamanoAnimal;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;
}