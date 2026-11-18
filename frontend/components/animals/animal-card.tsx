import Link from "next/link";
import { ageLabel, labelOf, SIZE_OPTIONS, SPECIES_OPTIONS, STATUS_LABELS } from "../../lib/animal-options";
import type { Animal } from "../../types/animal";
import { nunito, poppins } from "../auth/fonts";

type AnimalCardProps = {
  animal: Animal;
  href: string; // detalle al que lleva "Ver": cambia según el rol
  showStatus?: boolean; // en "Mis animales" la fundación ve el estado de cada uno
};

// Tarjeta del catálogo (componente "card" del Figma): foto principal,
// nombre, "especie | edad | tamaño" y el enlace "Ver".
// Se reutiliza en el catálogo público y en "Mis animales" de la fundación.
export default function AnimalCard({ animal, href, showStatus = false }: AnimalCardProps) {
  const photo = animal.fotos[0]?.url;
  const details = [
    labelOf(SPECIES_OPTIONS, animal.especie),
    ageLabel(animal.edadAproximadaMeses),
    labelOf(SIZE_OPTIONS, animal.tamano),
  ].join(" | ");

  return (
    // h-full: todas las tarjetas de una fila miden lo mismo.
    <article className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-[#BDBDBD] bg-white">
      {/* overflow-hidden + foto en absolute: la foto llena un cuadrado exacto
          y nunca lo estira, sea horizontal o vertical. */}
      <div className="relative aspect-square overflow-hidden bg-[#F7F7F7]">
        {photo && (
          // Las fotos son URLs de cualquier dominio, por eso <img> y no next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`Foto de ${animal.nombre}`} className="absolute inset-0 size-full object-cover" />
        )}
        {showStatus && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
            {STATUS_LABELS[animal.estado]}
          </span>
        )}
      </div>
      <div className="flex flex-1 items-start justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <h3 className={`${nunito.className} truncate text-2xl text-black`}>{animal.nombre}</h3>
          <p className={`${poppins.className} mt-2 text-xs text-[#757575]`}>{details}</p>
        </div>
        <Link
          href={href}
          className={`${poppins.className} shrink-0 text-lg text-[#4D70E6] hover:underline`}
          aria-label={`Ver a ${animal.nombre}`}
        >
          Ver &gt;
        </Link>
      </div>
    </article>
  );
}