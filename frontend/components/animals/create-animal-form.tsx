"use client";

import { useActionState } from "react";
import { createAnimal, type FormState } from "../../app/foundation/animals/actions";
import { AGE_OPTIONS, SEX_OPTIONS, SIZE_OPTIONS, SPECIES_OPTIONS } from "../../lib/animal-options";
import { nunito, poppins } from "../auth/fonts";
import FormErrors from "../form-errors";
import SubmitButton from "../submit-button";
import RadioGroup from "./radio-group";

const INPUT =
  "w-full rounded-lg border-2 border-[#BDBDBD] bg-[#F7F7F7] px-3 py-2 text-sm text-black placeholder:text-[#9E9E9E] focus:border-[#005595] focus:outline-none";

const initialState: FormState = { errors: [] };

// Formulario "Nuevo animal" (Figma: "mis animales", columna izquierda).
// useActionState guarda lo que devuelve la Server Action: si NestJS responde
// 400 o 403, los mensajes se muestran aquí sin perder la página.
// Además de los campos del Figma pide sexo, descripción y salud, porque
// el CreateAnimalDto del backend los exige.
export default function CreateAnimalForm() {
  const [state, formAction] = useActionState(createAnimal, initialState);

  return (
    <form action={formAction} className={`${poppins.className} flex flex-col gap-5 text-black`}>
      <h2 className={`${nunito.className} text-3xl text-[#005595] lg:text-4xl`}>Nuevo animal</h2>

      <FormErrors errors={state.errors} />

      <label className="flex flex-col gap-1 text-sm">
        <span>
          URL de la foto<span className="text-[#E5484D]">*</span>
        </span>
        <input name="photoUrl" type="url" required placeholder="https://..." className={INPUT} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>
          Nombre<span className="text-[#E5484D]">*</span>
        </span>
        <input name="name" required maxLength={60} placeholder="Insertar nombre..." className={INPUT} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <RadioGroup name="species" legend="Especie" options={SPECIES_OPTIONS} required />
        <RadioGroup name="sex" legend="Sexo" options={SEX_OPTIONS} required />
      </div>
      <RadioGroup name="age" legend="Edad" options={AGE_OPTIONS} required />
      <RadioGroup name="size" legend="Tamaño" options={SIZE_OPTIONS} required />

      <label className="flex flex-col gap-1 text-sm">
        <span>
          Descripción<span className="text-[#E5484D]">*</span>
        </span>
        <textarea
          name="description"
          required
          maxLength={2000}
          rows={3}
          placeholder="Cuéntanos cómo es..."
          className={INPUT}
        />
      </label>

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend>Salud</legend>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="vaccinated" className="size-4 accent-[#005595]" /> Vacunas al día
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="sterilized" className="size-4 accent-[#005595]" /> Esterilizado
        </label>
      </fieldset>

      <SubmitButton
        pendingText="Subiendo..."
        className={`${nunito.className} h-[56px] rounded-xl bg-[#005595] text-white`}
      >
        Subir animal
      </SubmitButton>
      <p className="text-xs text-[#757575]">
        Los elementos marcados con <span className="text-[#E5484D]">*</span> son obligatorios.
      </p>
    </form>
  );
}
