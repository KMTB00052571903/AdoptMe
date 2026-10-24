import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

// Avisos para un usuario (ej. solicitud aprobada, rechazada o cerrada por otra adopción).
@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita: es la misma columna que usa la relación de abajo (usuario_id).
  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  // N:1 obligatoria. Si se borra el usuario, se borran sus notificaciones.
  @ManyToOne(() => Usuario, (usuario) => usuario.notificaciones, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar' })
  tipo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;
}