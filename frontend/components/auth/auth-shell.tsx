import Image from "next/image";
import type { Rol } from "../../types/auth";
import { fredoka, poppins } from "./fonts";
import { ESTILOS_ROL } from "./role-styles";

type AuthShellProps = {
  rol: Rol; // decide el color y el logo
  children: React.ReactNode; // contenido de la tarjeta blanca
};

// Estructura visual compartida por login y registro:
// - Escritorio: logo a la izquierda y tarjeta sobre el color del rol a la derecha.
// - Móvil: franja blanca con el logo arriba y la tarjeta debajo.
// Cada página solo decide qué va dentro de la tarjeta.
export default function AuthShell({ rol, children }: AuthShellProps) {
  const estilo = ESTILOS_ROL[rol];

  return (
    <main className={`${poppins.className} flex min-h-screen flex-col lg:flex-row`}>
      {/* Logo y nombre: franja blanca arriba en móvil, mitad izquierda en escritorio */}
      <section className="flex flex-col items-center justify-center gap-2 bg-white px-4 py-8 lg:w-1/2 lg:gap-6">
        <Image
          src={estilo.logo}
          alt=""
          width={368}
          height={299}
          preload
          className="h-auto w-28 lg:w-[368px]"
        />
        <p className={`${fredoka.className} ${estilo.texto} text-5xl leading-none lg:text-8xl`}>
          AdoptMe
        </p>
      </section>

      {/* Tarjeta blanca sobre el color del rol */}
      <section
        className={`${estilo.fondo} flex flex-1 items-center justify-center px-4 py-10 lg:w-1/2`}
      >
        <div className="w-full max-w-[548px] overflow-hidden rounded-2xl bg-white">
          {children}
        </div>
      </section>
    </main>
  );
}
