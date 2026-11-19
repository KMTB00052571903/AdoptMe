import GridSkeleton from "../../../components/animals/grid-skeleton";

export default function MyAnimalsLoading() {
  return (
    <main className="flex-1 bg-white px-4 py-6 lg:px-6">
      <p className="mb-4 text-sm text-[#757575]">Cargando tus animales…</p>
      <GridSkeleton />
    </main>
  );
}
