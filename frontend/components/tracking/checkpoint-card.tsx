import type { Checkpoint, EstadoCheckpoint, TipoCheckpoint } from "../../types/checkpoint";
import { nunito } from "../auth/fonts";

type CheckpointCardProps = {
  checkpoint: Checkpoint;
  children?: React.ReactNode; // acción opcional al pie, por ejemplo "Responder"
};

const TITULO: Record<TipoCheckpoint, string> = {
  dia_30: "Seguimiento día 30",
  dia_90: "Seguimiento día 90",
};

// Colores de la paleta: amarillo pendiente, verde aprobado, rojo rechazado.
// El texto va en negro para que se lea bien sobre el fondo claro.
const ESTADO: Record<EstadoCheckpoint, { texto: string; clase: string }> = {
  pendiente: { texto: "Pendiente", clase: "border-[#F0A202] bg-[#F0A202]/15" },
  respondido: { texto: "Respondido", clase: "border-[#43A047] bg-[#43A047]/15" },
  vencido: { texto: "Vencido", clase: "border-[#E5484D] bg-[#E5484D]/15" },
};

// "2026-12-17" -> "17 de diciembre de 2026". Es una fecha sin hora: se lee
// en UTC para que no cambie de día por la zona horaria.
function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia)).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Fecha y hora de la respuesta, mostrada en la hora de Colombia
// (así no depende de la zona horaria del servidor donde corra Next.js).
function formatearFechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "long",
    timeStyle: "short",
  });
}

// Tarjeta de un checkpoint. Solo muestra datos que devuelve la API:
// el endpoint todavía no incluye el nombre ni la foto del animal.
export default function CheckpointCard({ checkpoint, children }: CheckpointCardProps) {
  const estado = ESTADO[checkpoint.estado];
  // Solo se enlaza si es una URL web; nunca otros esquemas como "javascript:".
  const fotoValida = checkpoint.fotoUrl && /^https?:\/\//i.test(checkpoint.fotoUrl);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border-2 border-[#BDBDBD] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={`${nunito.className} text-xl text-[#4D70E6]`}>{TITULO[checkpoint.tipo]}</h3>
        <span className={`rounded-full border px-3 py-0.5 text-sm text-black ${estado.clase}`}>
          {estado.texto}
        </span>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div>
          <dt className="text-[#757575]">Fecha programada</dt>
          <dd>{formatearFecha(checkpoint.fechaProgramada)}</dd>
        </div>
        {checkpoint.fechaRespuesta && (
          <div>
            <dt className="text-[#757575]">Respondido el</dt>
            <dd>{formatearFechaHora(checkpoint.fechaRespuesta)}</dd>
          </div>
        )}
        {checkpoint.comentario && (
          <div>
            <dt className="text-[#757575]">Comentario</dt>
            <dd className="break-words whitespace-pre-line">{checkpoint.comentario}</dd>
          </div>
        )}
        {checkpoint.fotoUrl && (
          <div>
            <dt className="text-[#757575]">Foto</dt>
            <dd className="break-all">
              {fotoValida ? (
                <a
                  href={checkpoint.fotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4D70E6] underline focus-visible:outline-2 focus-visible:outline-[#4D70E6]"
                >
                  Ver foto
                </a>
              ) : (
                checkpoint.fotoUrl
              )}
            </dd>
          </div>
        )}
      </dl>

      {children}

      {/* Identifica la adopción mientras la API no devuelve el animal. */}
      <p className="mt-auto text-xs text-[#757575]">
        Solicitud {checkpoint.solicitudId.slice(0, 8)}
      </p>
    </article>
  );
}
