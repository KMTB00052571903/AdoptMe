"use client";

import { useRouter } from "next/navigation";

// Botón "Actualizar" (patrón de la clase 3): pide a Next.js que vuelva a
// preparar la página en el servidor, que consulta de nuevo a NestJS con
// la cookie. El botón no hace fetch ni conoce el token.
export default function RefreshButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="rounded-xl border-2 border-[#4D70E6] px-4 py-2 text-[#4D70E6] hover:bg-[#4D70E6]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4D70E6]"
    >
      Actualizar
    </button>
  );
}
