import type { Animal } from "../../types/animal";

// Foto principal grande del detalle (orden 1).
// max-h-[65vh]: nunca pasa del 65% del alto de la pantalla, para que quepa
// completa en un portátil. shrink-0: no se aplasta si el texto de al lado es largo.
export default function AnimalPhoto({ animal }: { animal: Animal }) {
  const photo = animal.fotos[0]?.url;
  return (
    <div className="aspect-[3/4] max-h-[65vh] w-full shrink-0 overflow-hidden rounded-xl bg-[#F7F7F7] sm:max-w-[280px] lg:max-w-[360px]">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={`Foto de ${animal.nombre}`} className="size-full object-cover" />
      )}
    </div>
  );
}