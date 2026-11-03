import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Animal } from './animal.entity';

@Entity('ficha_salud')
export class FichaSalud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita: es la misma columna que usa la relación de abajo (animal_id).
  @Column({ name: 'animal_id', type: 'uuid' })
  animalId: string;

  // 1:1 obligatoria. @JoinColumn indica que la FK vive en esta tabla;
  // TypeORM la hace única (como máximo una ficha por animal).
  // Si se borra el animal, se borra su ficha.
  @OneToOne(() => Animal, (animal) => animal.fichaSalud, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ name: 'vacunas_al_dia', type: 'boolean' })
  vacunasAlDia: boolean;

  @Column({ type: 'boolean' })
  esterilizado: boolean;

  @Column({ name: 'condiciones_medicas', type: 'text', nullable: true })
  condicionesMedicas: string | null;

  @Column({ name: 'fecha_ultima_revision', type: 'date', nullable: true })
  fechaUltimaRevision: string | null;
}
