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

  // Presentación de la fundación que ven los adoptantes. Obligatoria.
  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar' })
  ciudad: string;

  // Teléfono para que los adoptantes contacten a la fundación. Obligatorio.
  @Column({ name: 'telefono_contacto', type: 'varchar' })
  telefonoContacto: string;

  // Lado inverso 1:N (no crea columnas). La FK está en animal.fundacion_id.
  @OneToMany(() => Animal, (animal) => animal.fundacion)
  animales: Animal[];
}