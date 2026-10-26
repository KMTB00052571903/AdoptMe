import * as argon2 from 'argon2';
import dataSource from '../data-source';
import { EspecieAnimal } from '../../common/enums/especie-animal.enum';
import { EstadoAnimal } from '../../common/enums/estado-animal.enum';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';
import { SexoAnimal } from '../../common/enums/sexo-animal.enum';
import { TamanoAnimal } from '../../common/enums/tamano-animal.enum';
import { Animal } from '../../animales/entities/animal.entity';
import { FichaSalud } from '../../animales/entities/ficha-salud.entity';
import { FotoAnimal } from '../../animales/entities/foto-animal.entity';
import { Adoptante } from '../../usuarios/entities/adoptante.entity';
import { Fundacion } from '../../usuarios/entities/fundacion.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

// Datos de prueba para desarrollo. Todos los usuarios tienen la misma
// contraseña para que el equipo pueda hacer login (está en el README).
const PASSWORD_DEMO = 'AdoptMe2026!';

const foto = (texto: string) =>
  `https://placehold.co/600x400?text=${encodeURIComponent(texto)}`;

const FUNDACIONES = [
  {
    email: 'patitas@adoptme.test',
    nombrePublico: 'Patitas Felices',
    descripcion: 'Fundación de rescate de perros y gatos en Cali.',
    ciudad: 'Cali',
    telefonoContacto: '+57 300 111 2233',
    animales: [
      {
        nombre: 'Luna',
        especie: EspecieAnimal.PERRO,
        sexo: SexoAnimal.HEMBRA,
        razaAproximada: 'Criolla',
        edadAproximadaMeses: 18,
        tamano: TamanoAnimal.MEDIANO,
        estado: EstadoAnimal.DISPONIBLE,
        descripcion: 'Tranquila y cariñosa, se lleva bien con otros perros.',
        fechaIngreso: '2026-09-15',
        fotos: [foto('Luna 1'), foto('Luna 2')],
        fichaSalud: { vacunasAlDia: true, esterilizado: true },
      },
      {
        nombre: 'Max',
        especie: EspecieAnimal.PERRO,
        sexo: SexoAnimal.MACHO,
        razaAproximada: 'Labrador mestizo',
        edadAproximadaMeses: 36,
        tamano: TamanoAnimal.GRANDE,
        estado: EstadoAnimal.DISPONIBLE,
        descripcion: 'Muy activo, ideal para una familia con patio.',
        fechaIngreso: '2026-08-02',
        fotos: [foto('Max')],
        fichaSalud: { vacunasAlDia: true, esterilizado: true },
      },
      {
        nombre: 'Michi',
        especie: EspecieAnimal.GATO,
        sexo: SexoAnimal.MACHO,
        edadAproximadaMeses: 6,
        tamano: TamanoAnimal.PEQUENO,
        estado: EstadoAnimal.DISPONIBLE,
        descripcion: 'Juguetón y curioso, ya usa arenero.',
        fechaIngreso: '2026-10-01',
        fotos: [foto('Michi')],
        fichaSalud: { vacunasAlDia: true, esterilizado: false },
      },
      {
        nombre: 'Nala',
        especie: EspecieAnimal.GATO,
        sexo: SexoAnimal.HEMBRA,
        edadAproximadaMeses: 24,
        tamano: TamanoAnimal.PEQUENO,
        estado: EstadoAnimal.NO_DISPONIBLE,
        descripcion: 'En recuperación de una cirugía; pronto disponible.',
        fechaIngreso: '2026-09-28',
        fotos: [foto('Nala')],
        fichaSalud: {
          vacunasAlDia: true,
          esterilizado: true,
          condicionesMedicas: 'Recuperación posoperatoria',
          fechaUltimaRevision: '2026-10-20',
        },
      },
    ],
  },
  {
    email: 'huellitas@adoptme.test',
    nombrePublico: 'Huellitas Bogotá',
    descripcion: 'Red de voluntarios que rescata animales en Bogotá.',
    ciudad: 'Bogotá',
    telefonoContacto: '+57 310 444 5566',
    animales: [
      {
        nombre: 'Rocky',
        especie: EspecieAnimal.PERRO,
        sexo: SexoAnimal.MACHO,
        razaAproximada: 'Pastor alemán mestizo',
        edadAproximadaMeses: 60,
        tamano: TamanoAnimal.GRANDE,
        estado: EstadoAnimal.DISPONIBLE,
        descripcion: 'Adulto calmado, buen compañero para paseos.',
        fechaIngreso: '2026-07-10',
        fotos: [foto('Rocky')],
        fichaSalud: { vacunasAlDia: true, esterilizado: true },
      },
      {
        nombre: 'Kiara',
        especie: EspecieAnimal.GATO,
        sexo: SexoAnimal.HEMBRA,
        edadAproximadaMeses: 3,
        tamano: TamanoAnimal.PEQUENO,
        estado: EstadoAnimal.DISPONIBLE,
        descripcion: 'Gatita de 3 meses, muy cariñosa.',
        fechaIngreso: '2026-10-12',
        fotos: [foto('Kiara')],
        fichaSalud: { vacunasAlDia: false, esterilizado: false },
      },
      {
        nombre: 'Toby',
        especie: EspecieAnimal.PERRO,
        sexo: SexoAnimal.MACHO,
        edadAproximadaMeses: 10,
        tamano: TamanoAnimal.PEQUENO,
        estado: EstadoAnimal.DISPONIBLE,
        descripcion: 'Cachorro pequeño, apto para apartamento.',
        fechaIngreso: '2026-09-05',
        fotos: [foto('Toby')],
        fichaSalud: { vacunasAlDia: true, esterilizado: false },
      },
      {
        nombre: 'Simba',
        especie: EspecieAnimal.GATO,
        sexo: SexoAnimal.MACHO,
        edadAproximadaMeses: 48,
        tamano: TamanoAnimal.MEDIANO,
        estado: EstadoAnimal.DISPONIBLE,
        descripcion: 'Independiente y tranquilo, prefiere un hogar sin perros.',
        fechaIngreso: '2026-06-20',
        fotos: [foto('Simba')],
        fichaSalud: { vacunasAlDia: true, esterilizado: true },
      },
    ],
  },
];

const ADOPTANTES = [
  {
    nombre: 'Ana Gómez',
    email: 'ana@adoptme.test',
    telefono: '+57 311 000 1122',
    direccion: 'Calle 5 # 38-20, Cali',
    experienciaPrevia: 'He tenido perros toda la vida.',
  },
  {
    nombre: 'Carlos Ruiz',
    email: 'carlos@adoptme.test',
    telefono: '+57 312 000 3344',
    direccion: 'Carrera 7 # 45-10, Bogotá',
  },
];

async function main() {
  await dataSource.initialize();
  const passwordHash = await argon2.hash(PASSWORD_DEMO);

  try {
    // Todo en una transacción: si algo falla, no queda nada a medias.
    await dataSource.transaction(async (manager) => {
      for (const { animales, email, ...datosFundacion } of FUNDACIONES) {
        // Si ya existe, se omite: el seed se puede correr varias veces.
        if (await manager.existsBy(Usuario, { email })) {
          console.log(`- ${email} ya existe, se omite`);
          continue;
        }

        const usuario = await manager.save(
          manager.create(Usuario, {
            nombre: datosFundacion.nombrePublico,
            email,
            passwordHash,
            rol: RolUsuario.FUNDACION,
          }),
        );
        const fundacion = await manager.save(
          manager.create(Fundacion, { ...datosFundacion, usuarioId: usuario.id }),
        );

        for (const { fotos, fichaSalud, ...datosAnimal } of animales) {
          const animal = await manager.save(
            manager.create(Animal, { ...datosAnimal, fundacionId: fundacion.id }),
          );
          await manager.save(
            manager.create(FichaSalud, { ...fichaSalud, animalId: animal.id }),
          );
          await manager.save(
            fotos.map((url, index) =>
              manager.create(FotoAnimal, {
                animalId: animal.id,
                url,
                orden: index + 1,
              }),
            ),
          );
        }

        console.log(`+ Fundación ${email} con ${animales.length} animales`);
      }

      for (const { nombre, email, ...datosAdoptante } of ADOPTANTES) {
        if (await manager.existsBy(Usuario, { email })) {
          console.log(`- ${email} ya existe, se omite`);
          continue;
        }

        const usuario = await manager.save(
          manager.create(Usuario, {
            nombre,
            email,
            passwordHash,
            rol: RolUsuario.ADOPTANTE,
          }),
        );
        await manager.save(
          manager.create(Adoptante, { ...datosAdoptante, usuarioId: usuario.id }),
        );

        console.log(`+ Adoptante ${email}`);
      }
    });

    console.log('Seed completado');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Error en el seed:', error);
  process.exit(1);
});