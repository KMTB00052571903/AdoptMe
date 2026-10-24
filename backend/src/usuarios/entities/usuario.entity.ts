import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';
import { Fundacion } from './fundacion.entity';
import { Adoptante } from './adoptante.entity';
import { Notificacion } from '../../notificaciones/entities/notificacion.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  // select: false -> las consultas normales NO traen el hash.
  // El login debe pedirlo explícitamente (select: { passwordHash: true }).
  @Column({ name: 'password_hash', type: 'varchar', select: false })
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

  // Lado inverso 1:N (no crea columnas). La FK está en notificacion.usuario_id.
  @OneToMany(() => Notificacion, (notificacion) => notificacion.usuario)
  notificaciones: Notificacion[];
}