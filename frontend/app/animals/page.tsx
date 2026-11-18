import Link from "next/link";
import { Suspense } from "react";
import AnimalCard from "../../components/animals/animal-card";
import AnimalFilters from "../../components/animals/animal-filters";
import Pagination from "../../components/animals/pagination";
import AppHeader from "../../components/app-header";
import { poppins } from "../../components/auth/fonts";
import PublicHeader from "../../components/public-header";
import { AGE_OPTIONS } from "../../lib/animal-options";
import { fetchCatalog, getOptionalUser } from "../../lib/animals-api";

const PAGE_SIZE = 9;

type CatalogPageProps = {
  searchParams: Promise<{ species?: string; age?: string; size?: string; page?: string }>;
};

// Catálogo público (Figma: "catalogo"). Lo puede ver cualquiera, con o sin sesión.
// Los filtros viven en la URL (los cambia el hook useAnimalFilters) y aquí,
// en el servidor, se traducen a los parámetros que espera GET /api/animales.
export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { species, age, size, page } = await searchParams;
  const user = await getOptionalUser();

  const query = new URLSearchParams({ page: page ?? "1", limit: String(PAGE_SIZE) });
  if (species) query.set("especie", species);
  if (size) query.set("tamano", size);
  const ageOption = AGE_OPTIONS.find((option) => option.value === age);
  if (ageOption?.minMonths) query.set("edadMinMeses", String(ageOption.minMonths));
  if (ageOption?.maxMonths) query.set("edadMaxMeses", String(ageOption.maxMonths));

  const result = await fetchCatalog(query);
  const totalPages = Math.ceil(result.total / result.limit);

  // La fundación va a su vista de edición; el adoptante (o alguien sin sesión,
  // que será enviado al login) va al detalle del adoptante.
  const detailHref = (id: string) =>
    user?.rol === "fundacion" ? `/foundation/animals/${id}` : `/adopter/animals/${id}`;

  const currentParams: Record<string, string> = {};
  if (species) currentParams.species = species;
  if (age) currentParams.age = age;
  if (size) currentParams.size = size;

  return (
    <>
      {user ? <AppHeader rol={user.rol} /> : <PublicHeader />}
      <div className={`${poppins.className} flex flex-1 flex-col bg-white text-black lg:flex-row`}>
        <Suspense>
          <AnimalFilters />
        </Suspense>

        <main className="flex-1 px-4 py-6 lg:px-6">
          <h1 className="sr-only">Catálogo de animales</h1>

          {result.data.length === 0 ? (
            // Estado vacío: no hay animales con estos filtros.
            <div className="mx-auto mt-16 max-w-md text-center">
              <p className="text-lg">No encontramos animales con esos filtros.</p>
              <Link href="/animals" className="mt-4 inline-block text-[#4D70E6] underline">
                Ver todos los animales
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-[#757575]">
                {result.total} {result.total === 1 ? "animal disponible" : "animales disponibles"}
              </p>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.data.map((animal) => (
                  <li key={animal.id}>
                    <AnimalCard animal={animal} href={detailHref(animal.id)} />
                  </li>
                ))}
              </ul>
              <Pagination page={result.page} totalPages={totalPages} params={currentParams} />
            </>
          )}
        </main>
      </div>
    </>
  );
}
