// Se muestra mientras la página consulta a NestJS. La cabecera del layout
// sigue visible; solo el contenido cambia por estas tarjetas grises.
export default function Loading() {
  return (
    <main className="flex-1 bg-white px-4 py-10" aria-busy="true">
      <div className="mx-auto max-w-5xl">
        <p className="sr-only">Cargando seguimientos...</p>
        <div className="h-10 w-64 animate-pulse rounded-lg bg-[#E5E5E5]" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 animate-pulse rounded-2xl bg-[#E5E5E5]" />
          ))}
        </div>
      </div>
    </main>
  );
}
