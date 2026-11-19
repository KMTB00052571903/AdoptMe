"use client";

import ErrorPanel from "../../../../components/animals/error-panel";

export default function FoundationAnimalError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel {...props} title="No pudimos cargar este animal" />;
}
