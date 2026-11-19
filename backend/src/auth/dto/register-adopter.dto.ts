import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Datos para registrar un adoptante (Usuario + perfil Adoptante).
// El rol no se envía: lo decide la ruta /auth/registro/adoptante.
export class RegistroAdoptanteDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(14)
  password!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsString()
  @IsNotEmpty()
  direccion!: string;

  // Opcional: en la entidad Adoptante es nullable.
  @IsOptional()
  @IsString()
  experienciaPrevia?: string;
}
