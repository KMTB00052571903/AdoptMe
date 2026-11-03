import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Animal } from './animal.entity';

// Un animal no puede tener dos fotos con el mismo orden; el orden empieza en 1.
@Entity('foto_animal')
@Unique('UQ_foto_animal_animal_orden', ['animalId', 'orden'])
@Check('CHK_foto_animal_orden', '"orden" >= 1')
export class FotoAnimal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita: es la misma columna que usa la relación de abajo (animal_id).
  @Column({ name: 'animal_id', type: 'uuid' })
  animalId: string;

  // N:1 obligatoria. Si se borra el animal, se borran sus fotos.
  @ManyToOne(() => Animal, (animal) => animal.fotos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'int' })
  orden: number;
}
