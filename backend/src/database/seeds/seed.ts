import * as argon2 from 'argon2';
import dataSource from '../data-source';
import { AnimalSpecies } from '../../common/enums/animal-species.enum';
import { AnimalStatus } from '../../common/enums/animal-status.enum';
import { RolUsuario } from '../../common/enums/user-role.enum';
import { AnimalSex } from '../../common/enums/animal-sex.enum';
import { AnimalSize } from '../../common/enums/animal-size.enum';
import { Animal } from '../../animals/entities/animal.entity';
import { HealthRecord } from '../../animals/entities/health-record.entity';
import { AnimalPhoto } from '../../animals/entities/animal-photo.entity';
import { Adoptante } from '../../users/entities/adopter.entity';
import { Fundacion } from '../../users/entities/foundation.entity';
import { Usuario } from '../../users/entities/user.entity';

// Datos de prueba para desarrollo. Todos los usuarios tienen la misma
// contraseña para que el equipo pueda hacer login (está en el README).
const PASSWORD_DEMO = 'AdoptMe2026!';

// Fotos reales de prueba (dog.ceo y thecatapi), para que la demo se vea bien.
const PHOTOS = {
  luna1: 'https://images.dog.ceo/breeds/labrador/n02099712_7866.jpg',
  luna2: 'https://images.dog.ceo/breeds/labrador/n02099712_7414.jpg',
  max: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_1442.jpg',
  michi: 'https://cdn2.thecatapi.com/images/cld.jpg',
  nala: 'https://cdn2.thecatapi.com/images/9rf.jpg',
  rocky: 'https://images.dog.ceo/breeds/german-shepherd/n02106662_10490.jpg',
  kiara: 'https://cdn2.thecatapi.com/images/3cf.jpg',
  toby: 'https://images.dog.ceo/breeds/beagle/n02088364_7927.jpg',
  simba: 'https://cdn2.thecatapi.com/images/e7o.jpg',
};

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
        especie: AnimalSpecies.DOG,
        sexo: AnimalSex.FEMALE,
        razaAproximada: 'Criolla',
        edadAproximadaMeses: 18,
        tamano: AnimalSize.MEDIUM,
        estado: AnimalStatus.AVAILABLE,
        descripcion: 'Tranquila y cariñosa, se lleva bien con otros perros.',
        fechaIngreso: '2026-09-15',
        fotos: [PHOTOS.luna1, PHOTOS.luna2],
        fichaSalud: { vacunasAlDia: true, esterilizado: true },
      },
      {
        nombre: 'Max',
        especie: AnimalSpecies.DOG,
        sexo: AnimalSex.MALE,
        razaAproximada: 'Labrador mestizo',
        edadAproximadaMeses: 36,
        tamano: AnimalSize.LARGE,
        estado: AnimalStatus.AVAILABLE,
        descripcion: 'Muy activo, ideal para una familia con patio.',
        fechaIngreso: '2026-08-02',
        fotos: [PHOTOS.max],
        fichaSalud: { vacunasAlDia: true, esterilizado: true },
      },
      {
        nombre: 'Michi',
        especie: AnimalSpecies.CAT,
        sexo: AnimalSex.MALE,
        edadAproximadaMeses: 6,
        tamano: AnimalSize.SMALL,
        estado: AnimalStatus.AVAILABLE,
        descripcion: 'Juguetón y curioso, ya usa arenero.',
        fechaIngreso: '2026-10-01',
        fotos: [PHOTOS.michi],
        fichaSalud: { vacunasAlDia: true, esterilizado: false },
      },
      {
        nombre: 'Nala',
        especie: AnimalSpecies.CAT,
        sexo: AnimalSex.FEMALE,
        edadAproximadaMeses: 24,
        tamano: AnimalSize.SMALL,
        estado: AnimalStatus.UNAVAILABLE,
        descripcion: 'En recuperación de una cirugía; pronto disponible.',
        fechaIngreso: '2026-09-28',
        fotos: [PHOTOS.nala],
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
        especie: AnimalSpecies.DOG,
        sexo: AnimalSex.MALE,
        razaAproximada: 'Pastor alemán mestizo',
        edadAproximadaMeses: 60,
        tamano: AnimalSize.LARGE,
        estado: AnimalStatus.AVAILABLE,
        descripcion: 'Adulto calmado, buen compañero para paseos.',
        fechaIngreso: '2026-07-10',
        fotos: [PHOTOS.rocky],
        fichaSalud: { vacunasAlDia: true, esterilizado: true },
      },
      {
        nombre: 'Kiara',
        especie: AnimalSpecies.CAT,
        sexo: AnimalSex.FEMALE,
        edadAproximadaMeses: 3,
        tamano: AnimalSize.SMALL,
        estado: AnimalStatus.AVAILABLE,
        descripcion: 'Gatita de 3 meses, muy cariñosa.',
        fechaIngreso: '2026-10-12',
        fotos: [PHOTOS.kiara],
        fichaSalud: { vacunasAlDia: false, esterilizado: false },
      },
      {
        nombre: 'Toby',
        especie: AnimalSpecies.DOG,
        sexo: AnimalSex.MALE,
        edadAproximadaMeses: 10,
        tamano: AnimalSize.SMALL,
        estado: AnimalStatus.AVAILABLE,
        descripcion: 'Cachorro pequeño, apto para apartamento.',
        fechaIngreso: '2026-09-05',
        fotos: [PHOTOS.toby],
        fichaSalud: { vacunasAlDia: true, esterilizado: false },
      },
      {
        nombre: 'Simba',
        especie: AnimalSpecies.CAT,
        sexo: AnimalSex.MALE,
        edadAproximadaMeses: 48,
        tamano: AnimalSize.MEDIUM,
        estado: AnimalStatus.AVAILABLE,
        descripcion: 'Independiente y tranquilo, prefiere un hogar sin perros.',
        fechaIngreso: '2026-06-20',
        fotos: [PHOTOS.simba],
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
            manager.create(HealthRecord, { ...fichaSalud, animalId: animal.id }),
          );
          await manager.save(
            fotos.map((url, index) =>
              manager.create(AnimalPhoto, {
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