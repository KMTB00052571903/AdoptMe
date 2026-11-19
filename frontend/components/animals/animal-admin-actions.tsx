"use client";

import { useActionState, useState } from "react";
import { deleteAnimal, updateAnimalStatus, type FormState } from "../../app/foundation/animals/actions";
import { STATUS_LABELS } from "../../lib/animal-options";
import type { Animal } from "../../types/animal";
import { nunito } from "../auth/fonts";
import FormErrors from "../form-errors";
import SubmitButton from "../submit-button";

const initialState: FormState = { errors: [] };

// Cambiar estado y "Eliminar ficha" (Figma: "detail - fundacion").
// Las reglas las decide el backend: si no se permite responde 409
// (por ejemplo, borrar un animal con solicitudes) y aquí se muestra el mensaje.
export default function AnimalAdminActions({ animal }: { animal: Animal }) {
  const [statusState, statusAction] = useActionState(updateAnimalStatus.bind(null, animal.id), initialState);
  const [deleteState, deleteAction] = useActionState(deleteAnimal.bind(null, animal.id), initialState);
  const [confirming, setConfirming] = useState(false);

  // A mano la fundación solo alterna disponible <-> no_disponible.
  const nextStatus = animal.estado === "no_disponible" ? "disponible" : "no_disponible";
  const canToggle = animal.estado === "disponible" || animal.estado === "no_disponible";

  return (
    <div className="flex flex-col gap-4 text-black">
      <p className="text-sm">
        Estado actual: <span className="font-semibold">{STATUS_LABELS[animal.estado]}</span>
      </p>

      {canToggle && (
        <form action={statusAction} className="flex flex-col gap-2">
          <FormErrors errors={statusState.errors} />
          <input type="hidden" name="status" value={nextStatus} />
          <SubmitButton
            pendingText="Cambiando..."
            className="w-full max-w-[220px] rounded-xl border-2 border-[#005595] px-4 py-3 text-sm text-[#005595]"
          >
            Marcar como {STATUS_LABELS[nextStatus].toLowerCase()}
          </SubmitButton>
        </form>
      )}

      <form action={deleteAction} className="flex flex-col gap-2">
        <FormErrors errors={deleteState.errors} />
        {confirming ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">¿Eliminar a {animal.nombre}? No se puede deshacer.</span>
            <SubmitButton
              pendingText="Eliminando..."
              className={`${nunito.className} rounded-xl bg-[#E5484D] px-5 py-3 text-sm text-white`}
            >
              Sí, eliminar
            </SubmitButton>
            <button type="button" onClick={() => setConfirming(false)} className="text-sm underline">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={`${nunito.className} h-[56px] w-full max-w-[220px] rounded-xl bg-[#E5484D] text-white`}
          >
            Eliminar ficha
          </button>
        )}
      </form>
    </div>
  );
}
