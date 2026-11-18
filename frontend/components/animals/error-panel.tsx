"use client";

import { useEffect } from "react";

type ErrorPanelProps = {
  error: Error & { digest?: string };
  retry: () => void;
  title: string;
};

// Estado de error compartido por los error.tsx de Animales: mensaje claro
// y botón para reintentar (vuelve a pedir los datos a la API).
export default function ErrorPanel({ error, retry, title }: ErrorPanelProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-md flex-1 px-4 py-16 text-center text-black">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-[#757575]">Puede que el servidor esté despertando. Espera unos segundos e inténtalo de nuevo.</p>
      <button type="button" onClick={() => retry()} className="mt-6 rounded-xl bg-[#4D70E6] px-6 py-3 text-white">
        Reintentar
      </button>
    </main>
  );
}
