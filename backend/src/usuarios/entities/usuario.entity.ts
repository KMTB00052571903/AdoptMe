import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';
import { Fundacion } from './fundacion.entity';
import { Adoptante } from './adoptante.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol: RolUsuario;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' })
  fechaRegistro: Date;

  // Lado inverso de las relaciones 1:1 (no crean columnas en esta tabla).
  // Según el rol, un usuario tiene solo uno de los dos perfiles.
  @OneToOne(() => Fundacion, (fundacion) => fundacion.usuario)
  fundacion?: Fundacion;

  @OneToOne(() => Adoptante, (adoptante) => adoptante.usuario)
  adoptante?: Adoptante;
}
