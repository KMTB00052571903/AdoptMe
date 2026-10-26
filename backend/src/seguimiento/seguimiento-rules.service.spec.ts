import { ConflictException } from '@nestjs/common';
import { EstadoCheckpoint } from '../common/enums/estado-checkpoint.enum';
import { TipoCheckpoint } from '../common/enums/tipo-checkpoint.enum';
import { Checkpoint } from './entities/checkpoint.entity';
import { SeguimientoRulesService } from './seguimiento-rules.service';

function checkpoint(
  estado: EstadoCheckpoint,
  fechaProgramada = '2026-11-24',
): Checkpoint {
  return { id: 'c-1', estado, fechaProgramada } as Checkpoint;
}

describe('SeguimientoRulesService', () => {
  let service: SeguimientoRulesService;

  beforeEach(() => {
    service = new SeguimientoRulesService();
  });

  describe('calcularFechasProgramadas', () => {
    it('adds 30 and 90 calendar days across months and years', () => {
      // 25 de octubre de 2026, hora local del servidor
      const aprobacion = new Date(2026, 9, 25, 12, 0);

      expect(service.calcularFechasProgramadas(aprobacion)).toEqual({
        [TipoCheckpoint.DIA_30]: '2026-11-24',
        [TipoCheckpoint.DIA_90]: '2027-01-23',
      });
    });

    it('counts from the approval day even late at night (no time zone shift)', () => {
      const tarde = new Date(2026, 9, 25, 23, 30);
      const temprano = new Date(2026, 9, 25, 0, 15);

      expect(service.calcularFechasProgramadas(tarde)).toEqual(
        service.calcularFechasProgramadas(temprano),
      );
      expect(
        service.calcularFechasProgramadas(tarde)[TipoCheckpoint.DIA_30],
      ).toBe('2026-11-24');
    });

    it('handles leap years', () => {
      // 1 de febrero de 2028: febrero tiene 29 días
      const aprobacion = new Date(2028, 1, 1, 10, 0);

      expect(service.calcularFechasProgramadas(aprobacion)).toEqual({
        [TipoCheckpoint.DIA_30]: '2028-03-02',
        [TipoCheckpoint.DIA_90]: '2028-05-01',
      });
    });
  });

  describe('estaVencido', () => {
    const hoy = new Date(2026, 10, 24, 18, 0); // 24 de noviembre de 2026

    const pendiente = (fecha: string) =>
      checkpoint(EstadoCheckpoint.PENDIENTE, fecha);

    it('is overdue when a pending checkpoint date has passed', () => {
      expect(service.estaVencido(pendiente('2026-11-23'), hoy)).toBe(true);
    });

    it('is not overdue on the scheduled day itself', () => {
      expect(service.estaVencido(pendiente('2026-11-24'), hoy)).toBe(false);
    });

    it('is not overdue before the scheduled day', () => {
      expect(service.estaVencido(pendiente('2026-12-01'), hoy)).toBe(false);
    });

    it('never marks an answered checkpoint as overdue', () => {
      const respondido = checkpoint(EstadoCheckpoint.RESPONDIDO, '2026-11-01');

      expect(service.estaVencido(respondido, hoy)).toBe(false);
    });
  });

  describe('ensurePuedeResponder', () => {
    it('allows a pending checkpoint', () => {
      expect(() =>
        service.ensurePuedeResponder(checkpoint(EstadoCheckpoint.PENDIENTE)),
      ).not.toThrow();
    });

    it('rejects an already answered checkpoint with 409', () => {
      expect(() =>
        service.ensurePuedeResponder(checkpoint(EstadoCheckpoint.RESPONDIDO)),
      ).toThrow(ConflictException);
    });

    it('rejects an overdue checkpoint with 409', () => {
      expect(() =>
        service.ensurePuedeResponder(checkpoint(EstadoCheckpoint.VENCIDO)),
      ).toThrow(ConflictException);
    });
  });
});
