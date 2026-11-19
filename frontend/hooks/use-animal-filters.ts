"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export type FilterKey = "species" | "age" | "size";

// Hook personalizado del catálogo: guarda los filtros en la URL
// (/animals?species=gato&age=adult) en vez de en un useState.
// Así el filtro sobrevive a recargar la página, se puede compartir el enlace
// y la página del servidor lee los mismos filtros para pedírselos a la API.
// Se reutiliza en cualquier lista que filtre con parámetros de la URL.
export function useAnimalFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // isPending es true mientras llega la página nueva: sirve para el estado de carga.
  const [isPending, startTransition] = useTransition();

  function navigate(params: URLSearchParams) {
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  // Cambia un filtro (null = "Todas") y vuelve a la página 1.
  function setFilter(key: FilterKey, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    navigate(params);
  }

  function clearFilters() {
    navigate(new URLSearchParams());
  }

  return {
    filters: {
      species: searchParams.get("species"),
      age: searchParams.get("age"),
      size: searchParams.get("size"),
    },
    hasFilters: ["species", "age", "size"].some((key) => searchParams.has(key)),
    isPending,
    setFilter,
    clearFilters,
  };
}
