/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSolicitudDto {
  @IsString()
  @IsNotEmpty()
  animalId!: string;

  @IsString()
  @IsNotEmpty()
  adoptanteId!: string;

  @IsString()
  @IsNotEmpty()
  motivacion!: string;

  @IsString()
  @IsNotEmpty()
  condicionesHogar!: string;
}
