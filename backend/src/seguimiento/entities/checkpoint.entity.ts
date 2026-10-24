import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EstadoCheckpoint } from '../../common/enums/estado-checkpoint.enum';
import { TipoCheckpoint } from '../../common/enums/tipo-checkpoint.enum';
import { SolicitudAdopcion } from '../../solicitudes/entities/solicitud-adopcion.entity';

// Regla F3: cada adopción aprobada tiene un checkpoint dia_30 y uno dia_90.
// El unique (solicitud, tipo) impide que se cree dos veces el mismo checkpoint.
// Que se creen exactamente al aprobar lo hace el servicio de solicitudes.
@Entity('checkpoint')
@Unique('UQ_checkpoint_solicitud_tipo', ['solicitudId', 'tipo'])
export class Checkpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita: es la misma columna que usa la relación de abajo (solicitud_id).
  @Column({ name: 'solicitud_id', type: 'uuid' })
  solicitudId: string;

  // N:1 obligatoria. Si se borra la solicitud, se borran sus checkpoints.
  @ManyToOne(() => SolicitudAdopcion, (solicitud) => solicitud.checkpoints, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: SolicitudAdopcion;

  @Column({ type: 'enum', enum: TipoCheckpoint })
  tipo: TipoCheckpoint;

  // Fecha de aprobación + 30 o + 90 días.
  @Column({ name: 'fecha_programada', type: 'date' })
  fechaProgramada: string;

  @Column({
    type: 'enum',
    enum: EstadoCheckpoint,
    default: EstadoCheckpoint.PENDIENTE,
  })
  estado: EstadoCheckpoint;

  // Campos de respuesta del adoptante: nulos mientras el checkpoint está pendiente.
  // El DTO de responder exige el comentario; la foto es opcional.
  @Column({ name: 'fecha_respuesta', type: 'timestamp', nullable: true })
  fechaRespuesta: Date | null;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @Column({ name: 'foto_url', type: 'varchar', nullable: true })
  fotoUrl: string | null;
}