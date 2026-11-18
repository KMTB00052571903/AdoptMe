import { ageLabel, labelOf, SEX_OPTIONS, SIZE_OPTIONS, SPECIES_OPTIONS } from "../../lib/animal-options";
import type { Animal } from "../../types/animal";
import { nunito } from "../auth/fonts";

// Bloque de información del detalle (Figma: "detail"): especie, edad,
// tamaño, salud y la fundación donde se encuentra.
export default function AnimalInfo({ animal }: { animal: Animal }) {
  return (
    <div className="text-lg lg:text-2xl">
      <h1 className={`${nunito.className} text-4xl text-[#4D70E6] lg:text-6xl`}>{animal.nombre}</h1>
      <ul className="mt-6 space-y-1">
        <li>Especie: {labelOf(SPECIES_OPTIONS, animal.especie)}</li>
        <li>Sexo: {labelOf(SEX_OPTIONS, animal.sexo)}</li>
        <li>Edad: {ageLabel(animal.edadAproximadaMeses)}</li>
        <li>Tamaño: {labelOf(SIZE_OPTIONS, animal.tamano)}</li>
      </ul>
      <p className="mt-6 text-base lg:text-lg">{animal.descripcion}</p>
      {animal.fichaSalud && (
        <p className="mt-4 text-base text-[#757575]">
          {animal.fichaSalud.vacunasAlDia ? "Vacunas al día" : "Vacunas pendientes"} ·{" "}
          {animal.fichaSalud.esterilizado ? "Esterilizado" : "Sin esterilizar"}
        </p>
      )}
      {animal.fundacion && (
        <div className="mt-8 text-base lg:text-xl">
          <p>Se encuentra en:</p>
          <p>{animal.fundacion.nombrePublico}</p>
          <p>{animal.fundacion.ciudad}</p>
          <p>Cel. {animal.fundacion.telefonoContacto}</p>
        </div>
      )}
    </div>
  );
}
