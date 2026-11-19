import Image from "next/image";
import Link from "next/link";
import { fredoka, nunito } from "./auth/fonts";

// Cabecera de las páginas públicas (catálogo sin sesión): logo y
// "Iniciar sesión". Usa el color del adoptante, que es quien explora.
export default function PublicHeader() {
  return (
    <header className="bg-[#4D70E6] text-white">
      <div className="flex h-[72px] items-center justify-between gap-4 px-4 lg:h-[133px] lg:items-end lg:px-[25px] lg:pb-[15px]">
        <Link href="/animals" className="flex items-center gap-3 lg:gap-6">
          <Image src="/logo-header-adoptante.svg" alt="" width={83} height={68} className="h-auto w-12 lg:w-[83px]" />
          <span className={`${fredoka.className} text-2xl leading-none lg:text-4xl`}>AdoptMe</span>
        </Link>
        <Link href="/login" className={`${nunito.className} pb-1 text-lg underline lg:pb-3 lg:text-2xl`}>
          Iniciar sesión
        </Link>
      </div>
    </header>
  );
}
