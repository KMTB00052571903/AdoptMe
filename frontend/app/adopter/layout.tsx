import AppHeader from "../../components/app-header";

// Estructura compartida por todas las páginas de /adopter: la cabecera del rol.
// Solo dibuja; NO protege. Cada page.tsx sigue llamando a requireRole("adoptante"),
// porque un layout no se vuelve a ejecutar al navegar entre sus páginas.
export default function AdopterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader rol="adoptante" />
      {children}
    </>
  );
}
