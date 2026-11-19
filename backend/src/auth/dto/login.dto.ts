import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Datos para iniciar sesión. No repite la regla de registro (8 a 14): una
// contraseña que no coincide responde 401 sin revelar qué falló.
// El máximo de 128 solo evita entradas absurdas antes de gastar CPU en argon2.
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}
