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
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EspecieAnimal } from '../../common/enums/especie-animal.enum';
import { SexoAnimal } from '../../common/enums/sexo-animal.enum';
import { TamanoAnimal } from '../../common/enums/tamano-animal.enum';
import { CreateFichaSaludDto } from './create-ficha-salud.dto';

export class CreateAnimalDto {
  // TEMPORAL: cuando exista Auth, la fundación sale del token (request.user)
  // y este campo se elimina del DTO.
  @IsUUID()
  fundacionId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre!: string;

  // HU01: no se puede publicar sin especie definida.
  @IsEnum(EspecieAnimal)
  especie!: EspecieAnimal;

  @IsEnum(SexoAnimal)
  sexo!: SexoAnimal;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  razaAproximada?: string;

  // Diccionario de datos del D1: entero mayor que 0. Máximo 300 meses (25 años).
  @IsInt()
  @Min(1)
  @Max(300)
  edadAproximadaMeses!: number;

  @IsEnum(TamanoAnimal)
  tamano!: TamanoAnimal;

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
  // a class-transformer que lo convierta en CreateFichaSaludDto.
  @ValidateNested()
  @Type(() => CreateFichaSaludDto)
  fichaSalud!: CreateFichaSaludDto;
}