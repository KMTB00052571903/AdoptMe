import AppHeader from "../../components/app-header";

// Estructura compartida por todas las páginas de /foundation: la cabecera del rol.
// Solo dibuja; NO protege. Cada page.tsx sigue llamando a requireRole("fundacion"),
// porque un layout no se vuelve a ejecutar al navegar entre sus páginas.
export default function FoundationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader rol="fundacion" />
      {children}
    </>
  );
}
