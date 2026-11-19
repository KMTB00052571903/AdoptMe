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
import { AnimalSpecies } from '../../common/enums/animal-species.enum';
import { AnimalSex } from '../../common/enums/animal-sex.enum';
import { AnimalSize } from '../../common/enums/animal-size.enum';

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
  @IsEnum(AnimalSpecies)
  especie?: AnimalSpecies;

  @IsOptional()
  @IsEnum(AnimalSex)
  sexo?: AnimalSex;

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
  @IsEnum(AnimalSize)
  tamano?: AnimalSize;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;
}