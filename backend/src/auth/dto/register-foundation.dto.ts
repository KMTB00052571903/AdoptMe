import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Datos para registrar una fundación (Usuario + perfil Fundacion).
// El rol no se envía: lo decide la ruta /auth/registro/fundacion.
export class RegistroFundacionDto {
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
  nombrePublico!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsString()
  @IsNotEmpty()
  ciudad!: string;

  @IsString()
  @IsNotEmpty()
  telefonoContacto!: string;
}
