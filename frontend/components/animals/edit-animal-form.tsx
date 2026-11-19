"use client";

import { useActionState } from "react";
import { updateAnimal, type FormState } from "../../app/foundation/animals/actions";
import { AGE_OPTIONS, ageCategoryOf, SIZE_OPTIONS, SPECIES_OPTIONS } from "../../lib/animal-options";
import type { Animal } from "../../types/animal";
import { nunito } from "../auth/fonts";
import FormErrors from "../form-errors";
import SubmitButton from "../submit-button";
import RadioGroup from "./radio-group";

const initialState: FormState = { errors: [] };

// Formulario de edición (Figma: "detail - fundacion"). Llega con los datos
// actuales marcados. bind() fija el id del animal como primer argumento.
export default function EditAnimalForm({ animal }: { animal: Animal }) {
  const [state, formAction] = useActionState(updateAnimal.bind(null, animal.id), initialState);
  const currentAge = ageCategoryOf(animal.edadAproximadaMeses);

  return (
    <form action={formAction} className="flex flex-col gap-5 text-black">
      <FormErrors errors={state.errors} />

      <label className="flex flex-col gap-1 text-sm">
        Cambiar nombre
        <input
          name="name"
          required
          maxLength={60}
          defaultValue={animal.nombre}
          className="w-full max-w-sm rounded-lg border-2 border-[#BDBDBD] bg-[#F7F7F7] px-3 py-2 focus:border-[#005595] focus:outline-none"
        />
      </label>
      <RadioGroup name="species" legend="Especie" options={SPECIES_OPTIONS} defaultValue={animal.especie} />
      <input type="hidden" name="currentAge" value={currentAge} />
      <RadioGroup name="age" legend="Cambiar edad" options={AGE_OPTIONS} defaultValue={currentAge} />
      <RadioGroup name="size" legend="Cambiar tamaño" options={SIZE_OPTIONS} defaultValue={animal.tamano} />

      <SubmitButton
        pendingText="Guardando..."
        className={`${nunito.className} h-[56px] w-full max-w-[220px] rounded-xl bg-[#005595] text-white`}
      >
        Actualizar información
      </SubmitButton>
    </form>
  );
}
