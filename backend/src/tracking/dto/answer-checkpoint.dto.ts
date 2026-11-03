import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Respuesta del adoptante a un checkpoint. El estado, la fecha de respuesta y
// el dueño los decide el servidor: si el cliente los envía, el pipe responde 400.
export class ResponderCheckpointDto {
  @IsString()
  @IsNotEmpty()
  comentario!: string;

  // URL de una foto ya publicada; AdoptMe no sube imágenes.
  @IsOptional()
  @IsString()
  fotoUrl?: string;
}
