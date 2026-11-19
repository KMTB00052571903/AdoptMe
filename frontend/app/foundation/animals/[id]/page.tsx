import AnimalAdminActions from "../../../../components/animals/animal-admin-actions";
import AnimalInfo from "../../../../components/animals/animal-info";
import AnimalPhoto from "../../../../components/animals/animal-photo";
import EditAnimalForm from "../../../../components/animals/edit-animal-form";
import { nunito, poppins } from "../../../../components/auth/fonts";
import BackLink from "../../../../components/back-link";
import FormAlert from "../../../../components/form-alert";
import { fetchAnimal } from "../../../../lib/animal-detail";
import { requireRole } from "../../../../lib/session";

const NOTICES: Record<string, string> = {
  updated: "Información actualizada.",
  status: "Estado actualizado.",
};

type FoundationAnimalPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
};

// Detalle de la fundación (Figma: "detail - fundacion"): editar y eliminar.
// Si el animal es de otra fundación solo se muestra la información: el
// backend respondería 403 a cualquier cambio (AnimalRulesService).
export default async function FoundationAnimalPage({ params, searchParams }: FoundationAnimalPageProps) {
  const user = await requireRole("fundacion");
  const { id } = await params;
  const { notice } = await searchParams;
  const animal = await fetchAnimal(id);
  const isOwner = animal.fundacionId === user.fundacionId;

  return (
    <main className={`${poppins.className} flex-1 bg-white px-4 py-6 text-black lg:px-10 lg:py-8`}>
      <BackLink href="/foundation/animals" />
      {notice && NOTICES[notice] && (
        <FormAlert variant="success" className="mt-4 max-w-xl">
          {NOTICES[notice]}
        </FormAlert>
      )}

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <AnimalPhoto animal={animal} />

        {isOwner ? (
          <div className="flex flex-1 flex-col gap-10 md:flex-row">
            <div className="flex-1">
              <h1 className={`${nunito.className} mb-6 text-4xl text-[#005595] lg:text-6xl`}>{animal.nombre}</h1>
              <EditAnimalForm animal={animal} />
            </div>
            <div className="md:w-[280px]">
              <AnimalAdminActions animal={animal} />
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <FormAlert variant="warning" className="mb-6 max-w-xl">
              Este animal pertenece a otra fundación: solo puedes ver su información.
            </FormAlert>
            <AnimalInfo animal={animal} />
          </div>
        )}
      </div>
    </main>
  );
}
