import { IsEnum } from 'class-validator';
import { EstadoAnimal } from '../../common/enums/estado-animal.enum';

// PATCH /animales/:id/estado
// El DTO solo revisa que sea un estado que existe. Qué cambios están
// permitidos lo decide AnimalRulesService (por ejemplo, 'adoptado' -> 409).
export class UpdateEstadoAnimalDto {
  @IsEnum(EstadoAnimal)
  estado!: EstadoAnimal;
}