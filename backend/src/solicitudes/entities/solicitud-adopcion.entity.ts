/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoSolicitud } from '../../common/enums/estado-solicitud.enum';
import { Animal } from '../../animales/entities/animal.entity';
import { Adoptante } from '../../usuarios/entities/adoptante.entity';
import { Checkpoint } from '../../seguimiento/entities/checkpoint.entity';

// Regla F2: un animal solo puede tener UNA solicitud aprobada.
// Índice único parcial de PostgreSQL: solo cuenta las filas con estado = 'aprobada',
// así que puede haber muchas pendientes/rechazadas, pero nunca dos aprobadas.
// El servicio también lo valida (dentro de una transacción); esto es la última defensa.
@Entity('solicitud_adopcion')
@Index('UQ_solicitud_aprobada_por_animal', ['animalId'], {
  unique: true,
  where: `"estado" = 'aprobada'`,
})
@Check(
  'CHK_solicitud_fecha_resolucion',
  '"fecha_resolucion" IS NULL OR "fecha_resolucion" >= "fecha_solicitud"',
)
export class SolicitudAdopcion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK explícita: es la misma columna que usa la relación de abajo (animal_id).
  @Column({ name: 'animal_id', type: 'uuid' })
  animalId!: string;

  // N:1 obligatoria. No se puede borrar un animal con solicitudes (protege el historial).
  @ManyToOne(() => Animal, (animal) => animal.solicitudes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'animal_id' })
  animal!: Animal;

  // FK explícita: es la misma columna que usa la relación de abajo (adoptante_id).
  @Column({ name: 'adoptante_id', type: 'uuid' })
  adoptanteId!: string;

  // N:1 obligatoria. No se puede borrar un adoptante con solicitudes.
  @ManyToOne(() => Adoptante, (adoptante) => adoptante.solicitudes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'adoptante_id' })
  adoptante!: Adoptante;

  @Column({ type: 'text' })
  motivacion!: string;

  @Column({ name: 'condiciones_hogar', type: 'text' })
  condicionesHogar!: string;

  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado!: EstadoSolicitud;

  // Solo se llena cuando la fundación rechaza la solicitud.
  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo!: string | null;

  @CreateDateColumn({ name: 'fecha_solicitud', type: 'timestamp' })
  fechaSolicitud!: Date;

  // Nula mientras está pendiente; se llena al aprobar, rechazar o cerrar.
  @Column({ name: 'fecha_resolucion', type: 'timestamp', nullable: true })
  fechaResolucion!: Date | null;

  // Lado inverso 1:N (no crea columnas). Exactamente dos (dia_30 y dia_90) al aprobarse.
  @OneToMany(() => Checkpoint, (checkpoint) => checkpoint.solicitud)
  checkpoints!: Checkpoint[];
}
