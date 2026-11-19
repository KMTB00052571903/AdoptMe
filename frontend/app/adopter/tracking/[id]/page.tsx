import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { nunito, poppins } from "../../../../components/auth/fonts";
import { ESTILOS_ROL } from "../../../../components/auth/role-styles";
import FormAlert from "../../../../components/form-alert";
import SubmitButton from "../../../../components/submit-button";
import CheckpointCard from "../../../../components/tracking/checkpoint-card";
import { apiFetch } from "../../../../lib/adoptme-api";
import { requireRole } from "../../../../lib/session";
import { getMisCheckpoints } from "../../../../lib/tracking-api";
import type { ResponderCheckpointBody } from "../../../../types/checkpoint";

// Formato de un UUID, como los ids que genera la base de datos.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// La foto es opcional, pero si viene debe ser un enlace web.
const URL_WEB = /^https?:\/\/\S+$/i;

const foco = ESTILOS_ROL.adoptante.foco;

// Server Action: envía la respuesta a NestJS con el JWT de la cookie.
async function responder(formData: FormData) {
  "use server";

  // Se vuelve a comprobar el rol: la acción también se puede llamar a mano.
  await requireRole("adoptante");

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/adopter/tracking");
  const volver = `/adopter/tracking/${id}`;

  const comentario = String(formData.get("comentario") ?? "").trim();
  const fotoUrl = String(formData.get("fotoUrl") ?? "").trim();
  if (!comentario) redirect(`${volver}?error=comentario`);
  if (fotoUrl && !URL_WEB.test(fotoUrl)) redirect(`${volver}?error=foto`);

  // Solo los campos del DTO. Si no hay foto, no se envía (el backend guardaría "").
  const body: ResponderCheckpointBody = { comentario };
  if (fotoUrl) body.fotoUrl = fotoUrl;

  const response = await apiFetch(`/seguimiento/checkpoints/${id}/responder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Éxito: volver al listado, que se vuelve a consultar en el servidor.
  if (response?.ok) redirect("/adopter/tracking?respondido=1");

  const ERROR_POR_CODIGO: Record<number, string> = {
    400: "datos",
    403: "permiso",
    404: "no-encontrado",
    409: "estado",
  };
  redirect(`${volver}?error=${ERROR_POR_CODIGO[response?.status ?? 0] ?? "conexion"}`);
}

const MENSAJES_ERROR: Record<string, string> = {
  comentario: "Escribe un comentario antes de enviar.",
  foto: "La foto debe ser un enlace que empiece por http:// o https://.",
  datos: "Revisa los datos del formulario.",
  permiso: "Tu sesión no identifica a un adoptante. Cierra sesión e inicia sesión de nuevo.",
  "no-encontrado": "No encontramos ese seguimiento entre los tuyos.",
  estado: "Este seguimiento ya no se puede responder: ya fue respondido o venció.",
  conexion: "No se pudo enviar la respuesta. Revisa tu conexión e inténtalo de nuevo.",
};

type ResponderPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ResponderCheckpointPage({
  params,
  searchParams,
}: ResponderPageProps) {
  await requireRole("adoptante");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { error } = await searchParams;

  // No existe GET por id: se busca dentro de los checkpoints propios.
  // Así, el checkpoint de otro adoptante simplemente no aparece (404).
  const { checkpoints, error: errorConsulta } = await getMisCheckpoints();
  const checkpoint = checkpoints?.find((c) => c.id === id);
  if (checkpoints && !checkpoint) notFound();

  const mensajeError = error ? MENSAJES_ERROR[error] : undefined;

  return (
    <main className={`${poppins.className} flex-1 bg-white px-4 py-10 text-black`}>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/adopter/tracking"
          className="text-[#4D70E6] underline focus-visible:outline-2 focus-visible:outline-[#4D70E6]"
        >
          ← Volver a mis seguimientos
        </Link>
        <h1 className={`${nunito.className} mt-4 text-[28px] text-[#4D70E6] lg:text-4xl`}>
          Responder seguimiento
        </h1>

        {errorConsulta && (
          <FormAlert variant="error" className="mt-6">
            {errorConsulta === "permiso"
              ? MENSAJES_ERROR.permiso
              : "No se pudo consultar el seguimiento. Inténtalo de nuevo más tarde."}
          </FormAlert>
        )}

        {checkpoint && (
          <div className="mt-6 flex flex-col gap-6">
            <CheckpointCard checkpoint={checkpoint} />

            {mensajeError && <FormAlert variant="error">{mensajeError}</FormAlert>}

            {checkpoint.estado === "respondido" && (
              <FormAlert variant="success">Ya respondiste este seguimiento.</FormAlert>
            )}
            {checkpoint.estado === "vencido" && (
              <FormAlert variant="warning">
                Este seguimiento venció y ya no se puede responder.
              </FormAlert>
            )}

            {/* El formulario solo aparece si el checkpoint todavía se puede responder. */}
            {checkpoint.estado === "pendiente" && (
              <form action={responder} className="flex flex-col gap-4">
                <input type="hidden" name="id" value={checkpoint.id} />

                <label className="flex flex-col gap-2 text-base">
                  <span>
                    ¿Cómo está tu mascota?
                    <span className="text-[#E5484D]" aria-hidden="true">
                      *
                    </span>
                  </span>
                  <textarea
                    name="comentario"
                    required
                    rows={5}
                    placeholder="Cuéntanos cómo se ha adaptado, su salud, su rutina..."
                    className={`${foco} resize-y rounded-lg border-2 border-[#BDBDBD] bg-[#F7F7F7] px-3 py-2 placeholder:text-[#9E9E9E] focus:outline-none`}
                  />
                </label>

                <label className="flex flex-col gap-2 text-base">
                  Enlace a una foto (opcional)
                  <input
                    name="fotoUrl"
                    type="url"
                    placeholder="https://..."
                    aria-describedby="fotoUrl-ayuda"
                    className={`${foco} h-[52px] min-w-0 rounded-lg border-2 border-[#BDBDBD] bg-[#F7F7F7] px-3 placeholder:text-[#9E9E9E] focus:outline-none`}
                  />
                  <span id="fotoUrl-ayuda" className="text-sm text-[#757575]">
                    Pega el enlace de una foto ya publicada en internet. AdoptMe no sube archivos.
                  </span>
                </label>

                <SubmitButton
                  pendingText="Enviando..."
                  className={`${nunito.className} ${ESTILOS_ROL.adoptante.fondo} h-[60px] w-full max-w-[220px] self-center rounded-xl text-white`}
                >
                  Enviar respuesta
                </SubmitButton>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
