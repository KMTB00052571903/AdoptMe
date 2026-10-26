import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Datos de salud que se envían junto con el animal al publicarlo (HU01).
export class CreateFichaSaludDto {
  @IsBoolean()
  vacunasAlDia!: boolean;

  @IsBoolean()
  esterilizado!: boolean;

  // Opcional: si no viene, no se valida; si viene, debe ser texto de máximo 500.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  condicionesMedicas?: string;

  // Opcional. Formato de fecha ISO: '2026-10-24'.
  @IsOptional()
  @IsDateString()
  fechaUltimaRevision?: string;
}