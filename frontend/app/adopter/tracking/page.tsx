import Link from "next/link";
import { nunito, poppins } from "../../../components/auth/fonts";
import FormAlert from "../../../components/form-alert";
import RefreshButton from "../../../components/refresh-button";
import CheckpointCard from "../../../components/tracking/checkpoint-card";
import { requireRole } from "../../../lib/session";
import { getMisCheckpoints } from "../../../lib/tracking-api";
import type { Checkpoint } from "../../../types/checkpoint";

type MisSeguimientosProps = {
  searchParams: Promise<{ respondido?: string }>;
};

// Mis seguimientos (UserFlow del adoptante). Primero se exige el rol;
// después se consultan los checkpoints reales en NestJS.
export default async function MisSeguimientosPage({ searchParams }: MisSeguimientosProps) {
  await requireRole("adoptante");
  const { respondido } = await searchParams;
  const { checkpoints, error } = await getMisCheckpoints();

  // La API ya los devuelve ordenados por fecha programada.
  const porResponder = checkpoints?.filter((c) => c.estado === "pendiente") ?? [];
  const historial = checkpoints?.filter((c) => c.estado !== "pendiente") ?? [];

  return (
    <main className={`${poppins.className} flex-1 bg-white px-4 py-10 text-black`}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className={`${nunito.className} text-[28px] text-[#4D70E6] lg:text-4xl`}>
            Mis seguimientos
          </h1>
          <RefreshButton />
        </div>
        <p className="mt-2 text-base text-[#757575]">
          Cuéntale a la fundación cómo está tu mascota a los 30 y a los 90 días de la adopción.
        </p>

        {respondido === "1" && (
          <FormAlert variant="success" className="mt-6 max-w-xl">
            Respuesta enviada. ¡Gracias por contarnos cómo está tu mascota!
          </FormAlert>
        )}
        {error === "permiso" && (
          <FormAlert variant="error" className="mt-6 max-w-xl">
            Tu sesión no identifica a un adoptante. Cierra sesión e inicia sesión de nuevo.
          </FormAlert>
        )}
        {error === "consulta" && (
          <FormAlert variant="error" className="mt-6 max-w-xl">
            No se pudieron consultar tus seguimientos. Inténtalo de nuevo con «Actualizar».
          </FormAlert>
        )}

        {checkpoints?.length === 0 && (
          <p className="mt-8 rounded-2xl border-2 border-dashed border-[#BDBDBD] p-6 text-center text-base">
            Todavía no tienes seguimientos. Aparecerán aquí cuando una fundación apruebe tu
            solicitud de adopción.
          </p>
        )}

        <ListaCheckpoints titulo="Por responder" checkpoints={porResponder} conResponder />
        <ListaCheckpoints titulo="Historial" checkpoints={historial} />
      </div>
    </main>
  );
}

type ListaCheckpointsProps = {
  titulo: string;
  checkpoints: Checkpoint[];
  conResponder?: boolean; // solo los pendientes llevan el botón "Responder"
};

// Una sección con su título y las tarjetas. Si no hay checkpoints, no se muestra.
function ListaCheckpoints({ titulo, checkpoints, conResponder = false }: ListaCheckpointsProps) {
  if (checkpoints.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className={`${nunito.className} text-2xl`}>{titulo}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {checkpoints.map((checkpoint) => (
          <CheckpointCard key={checkpoint.id} checkpoint={checkpoint}>
            {conResponder && (
              <Link
                href={`/adopter/tracking/${checkpoint.id}`}
                className="self-start rounded-xl bg-[#4D70E6] px-4 py-2 text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4D70E6]"
              >
                Responder
              </Link>
            )}
          </CheckpointCard>
        ))}
      </div>
    </section>
  );
}
