"use client";

import { useAnimalFilters, type FilterKey } from "../../hooks/use-animal-filters";
import { AGE_OPTIONS, SIZE_OPTIONS, SPECIES_OPTIONS } from "../../lib/animal-options";
import { nunito, poppins } from "../auth/fonts";

const GROUPS: { key: FilterKey; title: string; allLabel: string; options: { value: string; label: string }[] }[] = [
  { key: "species", title: "Especie", allLabel: "Todas", options: SPECIES_OPTIONS },
  { key: "age", title: "Edad", allLabel: "Todas", options: AGE_OPTIONS },
  { key: "size", title: "Tamaño", allLabel: "Cualquiera", options: SIZE_OPTIONS },
];

// Barra de filtros del catálogo (Figma: "Filtros"). La opción elegida va
// subrayada y en negro; las demás en gris. Usa el hook useAnimalFilters.
export default function AnimalFilters() {
  const { filters, hasFilters, isPending, setFilter, clearFilters } = useAnimalFilters();

  return (
    <aside className={`${poppins.className} bg-[#F7F7F7] px-6 py-8 lg:w-[300px] lg:shrink-0`}>
      <div className="flex items-center justify-between">
        <h2 className={`${nunito.className} text-3xl text-[#4D70E6] lg:text-4xl`}>Filtros</h2>
        {isPending && <span className="text-sm text-[#757575]">Actualizando…</span>}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-8">
        {GROUPS.map((group) => (
          <fieldset key={group.key}>
            <legend className={`${nunito.className} text-lg text-black lg:text-2xl`}>{group.title}</legend>
            <ul className="mt-2 flex flex-col gap-2 text-sm lg:mt-4 lg:gap-3 lg:text-lg">
              {[{ value: "", label: group.allLabel }, ...group.options].map((option) => {
                const active = (filters[group.key] ?? "") === option.value;
                return (
                  <li key={option.value || "all"}>
                    <button
                      type="button"
                      onClick={() => setFilter(group.key, option.value || null)}
                      aria-pressed={active}
                      className={active ? "text-black underline" : "text-[#9E9E9E] hover:text-black"}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      {hasFilters && (
        <button type="button" onClick={clearFilters} className="mt-6 text-sm text-[#4D70E6] underline">
          Quitar filtros
        </button>
      )}
    </aside>
  );
}
