// Estado de carga: tarjetas grises con la misma forma que las reales,
// para que la página no "salte" cuando llegan los datos.
export default function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul aria-label="Cargando animales" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="animate-pulse overflow-hidden rounded-xl border-2 border-[#E0E0E0]">
          <div className="aspect-square bg-[#EEEEEE]" />
          <div className="space-y-3 px-4 py-4">
            <div className="h-6 w-1/2 rounded bg-[#EEEEEE]" />
            <div className="h-3 w-3/4 rounded bg-[#EEEEEE]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
