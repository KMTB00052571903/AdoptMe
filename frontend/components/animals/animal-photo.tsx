import type { Animal } from "../../types/animal";

// Foto principal grande del detalle (orden 1).
export default function AnimalPhoto({ animal }: { animal: Animal }) {
  const photo = animal.fotos[0]?.url;
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F7F7F7] sm:max-w-[320px] lg:max-w-[490px]">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={`Foto de ${animal.nombre}`} className="size-full object-cover" />
      )}
    </div>
  );
}
