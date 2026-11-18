import { IsEnum } from 'class-validator';
import { AnimalStatus } from '../../common/enums/animal-status.enum';

// PATCH /animales/:id/estado
// El DTO solo revisa que sea un estado que existe. Qué changes están
// permitidos lo decide AnimalRulesService (por ejemplo, 'adoptado' -> 409).
export class UpdateAnimalStatusDto {
  @IsEnum(AnimalStatus)
  estado!: AnimalStatus;
}