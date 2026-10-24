import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EspecieAnimal } from '../../common/enums/especie-animal.enum';
import { EstadoAnimal } from '../../common/enums/estado-animal.enum';
import { SexoAnimal } from '../../common/enums/sexo-animal.enum';
import { TamanoAnimal } from '../../common/enums/tamano-animal.enum';
import { Fundacion } from '../../usuarios/entities/fundacion.entity';
import { FichaSalud } from './ficha-salud.entity';
import { FotoAnimal } from './foto-animal.entity';
import { SolicitudAdopcion } from '../../solicitudes/entities/solicitud-adopcion.entity';

@Entity('animal')
export class Animal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita: es la misma columna que usa la relación de abajo (fundacion_id).
  @Column({ name: 'fundacion_id', type: 'uuid' })
  fundacionId: string;

  // N:1 obligatoria. No se puede borrar una fundación que todavía tiene animales.
  @ManyToOne(() => Fundacion, (fundacion) => fundacion.animales, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'fundacion_id' })
  fundacion: Fundacion;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'enum', enum: EspecieAnimal })
  especie: EspecieAnimal;

  @Column({ type: 'enum', enum: SexoAnimal })
  sexo: SexoAnimal;

  @Column({ name: 'raza_aproximada', type: 'varchar', nullable: true })
  razaAproximada: string | null;

  // Mismo nombre de columna que en el diccionario de datos del D1.
  @Column({ name: 'edad_aproximada_meses', type: 'int' })
  edadAproximadaMeses: number;

  @Column({ type: 'enum', enum: TamanoAnimal })
  tamano: TamanoAnimal;

  @Column({
    type: 'enum',
    enum: EstadoAnimal,
    default: EstadoAnimal.DISPONIBLE,
  })
  estado: EstadoAnimal;

  // Texto que ve el adoptante en la ficha del catálogo. Obligatorio.
  @Column({ type: 'text' })
  descripcion: string;

  // Fecha en que el animal llegó a la fundación (solo día, sin hora). Obligatoria.
  @Column({ name: 'fecha_ingreso', type: 'date' })
  fechaIngreso: string;

  // Lado inverso 1:N (no crea columnas). La foto con orden 1 es la principal.
  @OneToMany(() => FotoAnimal, (foto) => foto.animal)
  fotos: FotoAnimal[];

  // Lado inverso 1:1 (la FK está en ficha_salud). cascade: ['insert'] permite
  // guardar la ficha nueva junto con el animal en un solo save().
  // La base de datos solo garantiza "como máximo una" ficha por animal; que
  // siempre exista una dependerá del servicio de creación de animales.
  @OneToOne(() => FichaSalud, (ficha) => ficha.animal, { cascade: ['insert'] })
  fichaSalud: FichaSalud;

  // Lado inverso 1:N (no crea columnas). Histórico de solicitudes del animal.
  @OneToMany(() => SolicitudAdopcion, (solicitud) => solicitud.animal)
  solicitudes: SolicitudAdopcion[];
}