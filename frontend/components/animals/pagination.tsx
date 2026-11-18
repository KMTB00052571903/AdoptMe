import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  // Filtros actuales, para no perderlos al cambiar de página.
  params: Record<string, string>;
};

// Paginación del catálogo: "Anterior · Página X de Y · Siguiente".
export default function Pagination({ page, totalPages, params }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => `?${new URLSearchParams({ ...params, page: String(target) })}`;
  const link = "rounded-lg border-2 border-[#4D70E6] px-4 py-2 text-[#4D70E6]";

  return (
    <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-4 text-sm">
      {page > 1 ? <Link href={hrefFor(page - 1)} className={link}>Anterior</Link> : <span />}
      <span>
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? <Link href={hrefFor(page + 1)} className={link}>Siguiente</Link> : <span />}
    </nav>
  );
}
