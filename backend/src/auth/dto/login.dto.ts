import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Datos para iniciar sesión. La contraseña no lleva límites de longitud aquí:
// si no coincide, el servicio responde 401 (no se revela qué falló).
// Pendiente: revisar entradas excesivamente largas al implementar el login.
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
