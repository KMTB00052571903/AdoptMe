"use client"; // En Next.js, los componentes de error deben ser de cliente.

import FormAlert from "../../../components/form-alert";

type ErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

// Se muestra si ocurre un error inesperado al preparar la página.
// No muestra error.message: puede contener detalles internos del servidor.
export default function Error({ retry }: ErrorProps) {
  return (
    <main className="flex-1 bg-white px-4 py-10 text-black">
      <div className="mx-auto max-w-5xl">
        <FormAlert variant="error" className="max-w-xl">
          No pudimos cargar tus seguimientos.
        </FormAlert>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-4 rounded-xl border-2 border-[#4D70E6] px-4 py-2 text-[#4D70E6] hover:bg-[#4D70E6]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4D70E6]"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
