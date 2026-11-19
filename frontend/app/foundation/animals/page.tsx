import AnimalCard from "../../../components/animals/animal-card";
import CreateAnimalForm from "../../../components/animals/create-animal-form";
import { poppins } from "../../../components/auth/fonts";
import FormAlert from "../../../components/form-alert";
import { apiFetch } from "../../../lib/adoptme-api";
import { readApiErrors } from "../../../lib/animals-api";
import { requireRole } from "../../../lib/session";
import type { Animal } from "../../../types/animal";

const NOTICES: Record<string, string> = {
  created: "Animal publicado. Ya aparece en el catálogo.",
  deleted: "Ficha eliminada.",
};

type MyAnimalsPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

// "Mis animales" de la fundación (Figma: "mis animales"): a la izquierda el
// formulario "Nuevo animal" y a la derecha sus animales, en cualquier estado.
// GET /api/animales/mine devuelve solo los de la fundación del token.
export default async function MyAnimalsPage({ searchParams }: MyAnimalsPageProps) {
  await requireRole("fundacion");
  const { notice } = await searchParams;

  const response = await apiFetch("/animales/mine");
  const animals: Animal[] = response?.ok ? await response.json() : [];
  const errors = response?.ok ? [] : await readApiErrors(response);

  return (
    <div className={`${poppins.className} flex flex-1 flex-col bg-white text-black lg:flex-row`}>
      <aside className="bg-[#F7F7F7] px-6 py-8 lg:w-[400px] lg:shrink-0">
        <CreateAnimalForm />
      </aside>

      <main className="flex-1 px-4 py-6 lg:px-6">
        <h1 className="sr-only">Mis animales</h1>
        {notice && NOTICES[notice] && (
          <FormAlert variant="success" className="mb-4">
            {NOTICES[notice]}
          </FormAlert>
        )}
        {errors.length > 0 && (
          <FormAlert variant="error" className="mb-4">
            No pudimos cargar tus animales: {errors.join(" ")}
          </FormAlert>
        )}

        {animals.length === 0 && errors.length === 0 ? (
          <p className="mt-16 text-center text-lg">Todavía no has publicado animales. Usa el formulario para subir el primero.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {animals.map((animal) => (
              <li key={animal.id}>
                <AnimalCard animal={animal} href={`/foundation/animals/${animal.id}`} showStatus />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
