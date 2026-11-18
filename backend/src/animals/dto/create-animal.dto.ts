import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { AnimalSpecies } from '../../common/enums/animal-species.enum';
import { AnimalSex } from '../../common/enums/animal-sex.enum';
import { AnimalSize } from '../../common/enums/animal-size.enum';
import { CreateHealthRecordDto } from './create-health-record.dto';

export class CreateAnimalDto {
  // No hay fundacionId: la fundación sale del token (req.user.fundacionId).
  // Si alguien lo manda en el body, forbidNonWhitelisted responde 400.
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre!: string;

  // HU01: no se puede publicar sin especie definida.
  @IsEnum(AnimalSpecies)
  especie!: AnimalSpecies;

  @IsEnum(AnimalSex)
  sexo!: AnimalSex;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  razaAproximada?: string;

  // Diccionario de datos del D1: entero mayor que 0. Máximo 300 meses (25 años).
  @IsInt()
  @Min(1)
  @Max(300)
  edadAproximadaMeses!: number;

  @IsEnum(AnimalSize)
  tamano!: AnimalSize;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descripcion!: string;

  // Formato ISO: '2026-10-24'.
  @IsDateString()
  fechaIngreso!: string;

  // HU01: al menos una foto. La primera de la lista será la principal (orden 1).
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  fotos!: string[];

  // Objeto anidado: @ValidateNested revisa sus reglas y @Type le dice
  // a class-transformer que lo convierta en CreateHealthRecordDto.
  @ValidateNested()
  @Type(() => CreateHealthRecordDto)
  fichaSalud!: CreateHealthRecordDto;
}