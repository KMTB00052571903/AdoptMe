import { ConflictException, ForbiddenException } from '@nestjs/common';
import { EstadoAnimal } from '../common/enums/estado-animal.enum';
import { AnimalRulesService } from './animal-rules.service';

describe('AnimalRulesService', () => {
  let rules: AnimalRulesService;

  // No tiene dependencias (ni repositorio ni otros servicios),
  // así que se crea directo, sin módulo de pruebas ni mocks.
  beforeEach(() => {
    rules = new AnimalRulesService();
  });

  describe('assertEsDeLaFundacion', () => {
    it('permite si el animal es de la misma fundación', () => {
      expect(() =>
        rules.assertEsDeLaFundacion('fundacion-1', 'fundacion-1'),
      ).not.toThrow();
    });

    it('lanza 403 si el animal es de otra fundación', () => {
      expect(() =>
        rules.assertEsDeLaFundacion('fundacion-1', 'fundacion-2'),
      ).toThrow(ForbiddenException);
    });
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

  describe('assertCambioEstadoPorSolicitud', () => {
    // Las 4 transiciones que permite el flujo de solicitudes (F2).
    it.each([
      [EstadoAnimal.DISPONIBLE, EstadoAnimal.EN_PROCESO],
      [EstadoAnimal.EN_PROCESO, EstadoAnimal.EN_PROCESO],
      [EstadoAnimal.EN_PROCESO, EstadoAnimal.ADOPTADO],
      [EstadoAnimal.EN_PROCESO, EstadoAnimal.DISPONIBLE],
    ])('permite pasar de %s a %s', (actual, nuevo) => {
      expect(() =>
        rules.assertCambioEstadoPorSolicitud(actual, nuevo),
      ).not.toThrow();
    });

    it.each([EstadoAnimal.ADOPTADO, EstadoAnimal.NO_DISPONIBLE])(
      'rechaza solicitudes para un animal %s',
      (actual) => {
        expect(() =>
          rules.assertCambioEstadoPorSolicitud(actual, EstadoAnimal.EN_PROCESO),
        ).toThrow('no está recibiendo solicitudes');
      },
    );

    it('rechaza aprobar un animal que no está en proceso', () => {
      expect(() =>
        rules.assertCambioEstadoPorSolicitud(
          EstadoAnimal.DISPONIBLE,
          EstadoAnimal.ADOPTADO,
        ),
      ).toThrow(ConflictException);
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