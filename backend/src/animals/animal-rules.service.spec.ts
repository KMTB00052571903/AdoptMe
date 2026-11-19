import { ConflictException, ForbiddenException } from '@nestjs/common';
import { AnimalStatus } from '../common/enums/animal-status.enum';
import { AnimalRulesService } from './animal-rules.service';

describe('AnimalRulesService', () => {
  let rules: AnimalRulesService;

  // No tiene dependencias (ni repository ni otros servicios),
  // así que se crea directo, sin módulo de pruebas ni mocks.
  beforeEach(() => {
    rules = new AnimalRulesService();
  });

  describe('assertBelongsToFoundation', () => {
    it('permite si el animal es de la misma fundación', () => {
      expect(() =>
        rules.assertBelongsToFoundation('fundacion-1', 'fundacion-1'),
      ).not.toThrow();
    });

    it('lanza 403 si el animal es de otra fundación', () => {
      expect(() =>
        rules.assertBelongsToFoundation('fundacion-1', 'fundacion-2'),
      ).toThrow(ForbiddenException);
    });
  });

  describe('assertManualStatusChange', () => {
    it('permite pasar de disponible a no_disponible', () => {
      expect(() =>
        rules.assertManualStatusChange(
          AnimalStatus.AVAILABLE,
          AnimalStatus.UNAVAILABLE,
        ),
      ).not.toThrow();
    });

    it('permite pasar de no_disponible a disponible', () => {
      expect(() =>
        rules.assertManualStatusChange(
          AnimalStatus.UNAVAILABLE,
          AnimalStatus.AVAILABLE,
        ),
      ).not.toThrow();
    });

    // it.each corre la misma prueba con cada valor de la lista.
    it.each([AnimalStatus.IN_PROCESS, AnimalStatus.ADOPTED])(
      'rechaza poner %s a mano (solo lo hace F2)',
      (nuevo) => {
        expect(() =>
          rules.assertManualStatusChange(AnimalStatus.AVAILABLE, nuevo),
        ).toThrow(ConflictException);
      },
    );

    it('rechaza cambiar el estado de un animal adoptado', () => {
      expect(() =>
        rules.assertManualStatusChange(
          AnimalStatus.ADOPTED,
          AnimalStatus.AVAILABLE,
        ),
      ).toThrow('El animal ya fue adoptado');
    });

    it('rechaza cambiar el estado de un animal con solicitudes pendientes', () => {
      expect(() =>
        rules.assertManualStatusChange(
          AnimalStatus.IN_PROCESS,
          AnimalStatus.UNAVAILABLE,
        ),
      ).toThrow(ConflictException);
    });

    it('rechaza cambiar al mismo estado', () => {
      expect(() =>
        rules.assertManualStatusChange(
          AnimalStatus.AVAILABLE,
          AnimalStatus.AVAILABLE,
        ),
      ).toThrow("El animal ya está en estado 'disponible'");
    });
  });

  describe('assertStatusChangeFromRequest', () => {
    // Las 4 transiciones que permite el flujo de solicitudes (F2).
    it.each([
      [AnimalStatus.AVAILABLE, AnimalStatus.IN_PROCESS],
      [AnimalStatus.IN_PROCESS, AnimalStatus.IN_PROCESS],
      [AnimalStatus.IN_PROCESS, AnimalStatus.ADOPTED],
      [AnimalStatus.IN_PROCESS, AnimalStatus.AVAILABLE],
    ])('permite pasar de %s a %s', (actual, nuevo) => {
      expect(() =>
        rules.assertStatusChangeFromRequest(actual, nuevo),
      ).not.toThrow();
    });

    it.each([AnimalStatus.ADOPTED, AnimalStatus.UNAVAILABLE])(
      'rechaza solicitudes para un animal %s',
      (actual) => {
        expect(() =>
          rules.assertStatusChangeFromRequest(actual, AnimalStatus.IN_PROCESS),
        ).toThrow('no está recibiendo solicitudes');
      },
    );

    it('rechaza aprobar un animal que no está en proceso', () => {
      expect(() =>
        rules.assertStatusChangeFromRequest(
          AnimalStatus.AVAILABLE,
          AnimalStatus.ADOPTED,
        ),
      ).toThrow(ConflictException);
    });
  });

  describe('assertCanDelete', () => {
    it('permite eliminar un animal sin solicitudes', () => {
      expect(() => rules.assertCanDelete(0)).not.toThrow();
    });

    it('rechaza eliminar un animal con solicitudes', () => {
      expect(() => rules.assertCanDelete(2)).toThrow(ConflictException);
    });
  });
});