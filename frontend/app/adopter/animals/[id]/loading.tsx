// Estado de carga del detalle mientras llega la respuesta de la API.
export default function AdopterAnimalLoading() {
  return (
    <main className="flex-1 animate-pulse bg-white px-4 py-14 lg:px-10">
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="aspect-[3/4] w-full rounded-xl bg-[#EEEEEE] sm:max-w-[320px]" />
        <div className="flex-1 space-y-4">
          <div className="h-12 w-1/2 rounded bg-[#EEEEEE]" />
          <div className="h-5 w-1/3 rounded bg-[#EEEEEE]" />
          <div className="h-5 w-1/3 rounded bg-[#EEEEEE]" />
        </div>
      </div>
    </main>
  );
}
