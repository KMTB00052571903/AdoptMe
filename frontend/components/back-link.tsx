import Link from "next/link";

// Flecha "volver" de las pantallas de detalle del Figma.
export default function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="Volver" className="inline-block rounded-md p-1 text-black">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M19 12H5m6-6-6 6 6 6" />
      </svg>
    </Link>
  );
}
