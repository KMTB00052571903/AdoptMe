"use client";

import ErrorPanel from "../../../components/animals/error-panel";

export default function MyAnimalsError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel {...props} title="No pudimos cargar esta página" />;
}
