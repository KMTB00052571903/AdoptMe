import { ConflictException } from '@nestjs/common';
import { EstadoAnimal } from '../common/enums/estado-animal.enum';
import { AnimalRulesService } from './animal-rules.service';

describe('AnimalRulesService', () => {
  let rules: AnimalRulesService;

  // No tiene dependencias (ni repositorio ni otros servicios),
  // así que se crea directo, sin módulo de pruebas ni mocks.
  beforeEach(() => {
    rules = new AnimalRulesService();
  });

  describe('assertCambioEstadoManual', () => {
    it('permite pasar de disponible a no_disponible', () => {
      expect(() =>
        rules.assertCambioEstadoManual(
          EstadoAnimal.DISPONIBLE,
          EstadoAnimal.NO_DISPONIBLE,
        ),
      ).not.toThrow();
    });

    it('permite pasar de no_disponible a disponible', () => {
      expect(() =>
        rules.assertCambioEstadoManual(
          EstadoAnimal.NO_DISPONIBLE,
          EstadoAnimal.DISPONIBLE,
        ),
      ).not.toThrow();
    });

    // it.each corre la misma prueba con cada valor de la lista.
    it.each([EstadoAnimal.EN_PROCESO, EstadoAnimal.ADOPTADO])(
      'rechaza poner %s a mano (solo lo hace F2)',
      (nuevo) => {
        expect(() =>
          rules.assertCambioEstadoManual(EstadoAnimal.DISPONIBLE, nuevo),
        ).toThrow(ConflictException);
      },
    );

    it('rechaza cambiar el estado de un animal adoptado', () => {
      expect(() =>
        rules.assertCambioEstadoManual(
          EstadoAnimal.ADOPTADO,
          EstadoAnimal.DISPONIBLE,
        ),
      ).toThrow('El animal ya fue adoptado');
    });

    it('rechaza cambiar el estado de un animal con solicitudes pendientes', () => {
      expect(() =>
        rules.assertCambioEstadoManual(
          EstadoAnimal.EN_PROCESO,
          EstadoAnimal.NO_DISPONIBLE,
        ),
      ).toThrow(ConflictException);
    });

    it('rechaza cambiar al mismo estado', () => {
      expect(() =>
        rules.assertCambioEstadoManual(
          EstadoAnimal.DISPONIBLE,
          EstadoAnimal.DISPONIBLE,
        ),
      ).toThrow("El animal ya está en estado 'disponible'");
    });
  });

  describe('assertPuedeEliminar', () => {
    it('permite eliminar un animal sin solicitudes', () => {
      expect(() => rules.assertPuedeEliminar(0)).not.toThrow();
    });

    it('rechaza eliminar un animal con solicitudes', () => {
      expect(() => rules.assertPuedeEliminar(2)).toThrow(ConflictException);
    });
  });
});