type FormAlertProps = {
  variant: "error" | "warning" | "success";
  children: React.ReactNode; // texto del aviso
  className?: string; // márgenes, los decide la pantalla
};

// Colores de la paleta de AdoptMe: rojo rechazado, amarillo pendiente y
// verde aprobado. El aviso amarillo y el verde usan texto negro porque el
// amarillo y el verde sobre fondo claro casi no se leen.
const VARIANTES = {
  error: "border-[#E5484D] bg-[#E5484D]/10 text-[#E5484D]",
  warning: "border-[#F0A202] bg-[#F0A202]/15 text-black",
  success: "border-[#43A047] bg-[#43A047]/10 text-black",
};

// Aviso reutilizable para errores, advertencias y confirmaciones.
// role="alert" hace que los lectores de pantalla lo anuncien.
export default function FormAlert({ variant, children, className = "" }: FormAlertProps) {
  return (
    <p
      role="alert"
      className={`${className} rounded-lg border px-3 py-2 text-sm ${VARIANTES[variant]}`}
    >
      {children}
    </p>
  );
}
