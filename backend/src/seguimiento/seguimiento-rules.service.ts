import { ConflictException, Injectable } from '@nestjs/common';
import { EstadoCheckpoint } from '../common/enums/estado-checkpoint.enum';
import { TipoCheckpoint } from '../common/enums/tipo-checkpoint.enum';
import { Checkpoint } from './entities/checkpoint.entity';

const DIAS_POR_TIPO: Record<TipoCheckpoint, number> = {
  [TipoCheckpoint.DIA_30]: 30,
  [TipoCheckpoint.DIA_90]: 90,
};

// Convierte un día del calendario en 'YYYY-MM-DD' (formato de una columna date).
// Date.UTC solo se usa para sumar días sin horas de por medio: 32 de octubre
// pasa a 1 de noviembre y no hay saltos por zona horaria ni horario de verano.
function aFechaSinHora(anio: number, mes: number, dia: number): string {
  return new Date(Date.UTC(anio, mes, dia)).toISOString().slice(0, 10);
}

// Reglas de Seguimiento: deciden sin consultar ni guardar en la base de datos.
@Injectable()
export class SeguimientoRulesService {
  // Días calendario desde el día (hora local del servidor) en que se aprobó.
  // Una aprobación a las 23:30 cuenta desde ese mismo día, no desde el siguiente.
  calcularFechasProgramadas(
    fechaAprobacion: Date,
  ): Record<TipoCheckpoint, string> {
    const anio = fechaAprobacion.getFullYear();
    const mes = fechaAprobacion.getMonth();
    const dia = fechaAprobacion.getDate();
    return {
      [TipoCheckpoint.DIA_30]: aFechaSinHora(
        anio,
        mes,
        dia + DIAS_POR_TIPO[TipoCheckpoint.DIA_30],
      ),
      [TipoCheckpoint.DIA_90]: aFechaSinHora(
        anio,
        mes,
        dia + DIAS_POR_TIPO[TipoCheckpoint.DIA_90],
      ),
    };
  }

  // Política provisional: un checkpoint pendiente vence cuando su fecha
  // programada ya pasó. El mismo día programado todavía se puede responder.
  estaVencido(checkpoint: Checkpoint, hoy: Date): boolean {
    const hoySinHora = aFechaSinHora(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );
    return (
      checkpoint.estado === EstadoCheckpoint.PENDIENTE &&
      checkpoint.fechaProgramada < hoySinHora
    );
  }

  ensurePuedeResponder(checkpoint: Checkpoint): void {
    if (checkpoint.estado === EstadoCheckpoint.RESPONDIDO) {
      throw new ConflictException('El checkpoint ya fue respondido');
    }
    if (checkpoint.estado === EstadoCheckpoint.VENCIDO) {
      throw new ConflictException('El checkpoint está vencido');
    }
  }
}
