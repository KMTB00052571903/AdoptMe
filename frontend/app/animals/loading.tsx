import GridSkeleton from "../../components/animals/grid-skeleton";

// Next.js muestra este archivo mientras page.tsx espera a la API.
export default function CatalogLoading() {
  return (
    <main className="flex-1 bg-white px-4 py-6 lg:px-6">
      <p className="mb-4 text-sm text-[#757575]">Cargando catálogo…</p>
      <GridSkeleton />
    </main>
  );
}
