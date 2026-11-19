import AnimalInfo from "../../../../components/animals/animal-info";
import AnimalPhoto from "../../../../components/animals/animal-photo";
import { poppins } from "../../../../components/auth/fonts";
import BackLink from "../../../../components/back-link";
import { fetchAnimal } from "../../../../lib/animal-detail";
import { requireRole } from "../../../../lib/session";

type AdopterAnimalPageProps = {
  params: Promise<{ id: string }>;
};

// Detalle para el adoptante (Figma: "detail"). Acordado con el equipo: el
// catálogo es público, pero el detalle solo lo ve un adoptante con sesión.
// En el backend, GET /api/animales/:id también pide token (JwtAuthGuard).
export default async function AdopterAnimalPage({ params }: AdopterAnimalPageProps) {
  await requireRole("adoptante");
  const { id } = await params;
  const animal = await fetchAnimal(id);

  return (
    <div className={`${poppins.className} flex flex-1 flex-col bg-white text-black lg:flex-row`}>
      <section className="flex-1 px-4 py-6 lg:px-10 lg:py-8">
        <BackLink href="/animals" />
        <div className="mt-6 flex flex-col gap-8 sm:flex-row">
          <AnimalPhoto animal={animal} />
          <AnimalInfo animal={animal} />
        </div>
      </section>

      {/* Panel derecho del Figma: formulario de solicitud de adopción (F2, Rosa).
          Rosa monta aquí su formulario y le pasa animal.id. */}
      <section
        id="adoption-request"
        aria-label="Solicitud de adopción"
        className="bg-[#E8EEFC] px-4 py-8 lg:w-[45%] lg:px-12"
      >
        <p className="text-center text-[#757575]">Formulario de solicitud de adopción (F2).</p>
      </section>
    </div>
  );
}
