"use client";

import ErrorPanel from "../../components/animals/error-panel";

// Si la API falla (o no responde), Next.js muestra esto en vez del catálogo.
export default function CatalogError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel {...props} title="No pudimos cargar el catálogo" />;
}
