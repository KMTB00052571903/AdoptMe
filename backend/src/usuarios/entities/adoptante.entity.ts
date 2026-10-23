import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('adoptante')
export class Adoptante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita: es la misma columna que usa la relación de abajo (usuario_id).
  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  // 1:1 obligatoria. @JoinColumn indica que la FK vive en esta tabla;
  // TypeORM la hace única. Si se borra el usuario, se borra el adoptante.
  @OneToOne(() => Usuario, (usuario) => usuario.adoptante, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar' })
  telefono: string;

  @Column({ name: 'experiencia_previa', type: 'text', nullable: true })
  experienciaPrevia: string | null;
}
