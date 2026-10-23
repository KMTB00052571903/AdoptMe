import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity';
import { Usuario } from './usuario.entity';

@Entity('fundacion')
export class Fundacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita: es la misma columna que usa la relación de abajo (usuario_id).
  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  // 1:1 obligatoria. @JoinColumn indica que la FK vive en esta tabla;
  // TypeORM la hace única. Si se borra el usuario, se borra la fundación.
  @OneToOne(() => Usuario, (usuario) => usuario.fundacion, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'nombre_publico', type: 'varchar' })
  nombrePublico: string;

  @Column({ type: 'varchar' })
  ciudad: string;

  // Lado inverso 1:N (no crea columnas). La FK está en animal.fundacion_id.
  @OneToMany(() => Animal, (animal) => animal.fundacion)
  animales: Animal[];
}
