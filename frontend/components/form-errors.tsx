import FormAlert from "./form-alert";

// Muestra la lista de errores que devolvió el backend en un aviso rojo.
export default function FormErrors({ errors, className = "" }: { errors: string[]; className?: string }) {
  if (errors.length === 0) return null;
  return (
    <FormAlert variant="error" className={className}>
      {errors.length === 1 ? (
        errors[0]
      ) : (
        <span className="flex flex-col gap-1">
          {errors.map((error) => (
            <span key={error}>• {error}</span>
          ))}
        </span>
      )}
    </FormAlert>
  );
}
