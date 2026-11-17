"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode; // texto normal, por ejemplo "Iniciar sesión"
  pendingText: string; // texto mientras se envía, por ejemplo "Ingresando..."
  className?: string;
};

// Botón de envío que se desactiva mientras la Server Action del formulario
// se está ejecutando. Debe ir DENTRO de un <form>: useFormStatus lee el
// estado del formulario que lo contiene.
export default function SubmitButton({
  children,
  pendingText,
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
