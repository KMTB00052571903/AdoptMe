import Image from "next/image";
import Link from "next/link";
import { logout } from "../lib/auth-actions";
import { PANEL_POR_ROL, NAV_POR_ROL } from "../lib/routes";
import type { Rol } from "../types/auth";
import { fredoka, nunito, poppins } from "./auth/fonts";
import { ESTILOS_ROL } from "./auth/role-styles";
import SubmitButton from "./submit-button";

type AppHeaderProps = {
  rol: Rol; // decide el color, el logo, el destino del logo y los enlaces
};

// Logo de la cabecera: casa blanca con los animales del color del rol.
// Son los SVG exportados de Figma, sin modificar.
const LOGO_CABECERA: Record<Rol, string> = {
  adoptante: "/logo-header-adoptante.svg",
  fundacion: "/logo-header-fundacion.svg",
};

// Contorno blanco visible al llegar con Tab, sobre el fondo azul.
const FOCO = "rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

// Dentro del menú (fondo blanco) el contorno de foco usa el color del rol.
const FOCO_MENU: Record<Rol, string> = {
  adoptante: "focus-visible:outline-2 focus-visible:outline-[#4D70E6]",
  fundacion: "focus-visible:outline-2 focus-visible:outline-[#005595]",
};

// Cabecera compartida de las pantallas privadas (diseño de Figma de Fundación).
// Es un componente de servidor: no usa estado ni eventos del navegador
// (el único componente de cliente es el botón SubmitButton del menú).
// No comprueba permisos: eso lo hace cada página con requireRole().
export default function AppHeader({ rol }: AppHeaderProps) {
  const enlaces = NAV_POR_ROL[rol];

  return (
    <header className={`${ESTILOS_ROL[rol].fondo} text-white`}>
      <div className="flex h-[72px] items-center justify-between gap-4 px-4 lg:h-[133px] lg:items-end lg:px-[25px] lg:pb-[15px]">
        {/* Logo y nombre: llevan al panel del propio rol */}
        <Link href={PANEL_POR_ROL[rol]} className={`${FOCO} flex shrink-0 items-center gap-3 lg:gap-6`}>
          <Image
            src={LOGO_CABECERA[rol]}
            alt=""
            width={83}
            height={68}
            preload
            className="h-auto w-12 lg:w-[83px]"
          />
          <span className={`${fredoka.className} text-2xl leading-none lg:text-4xl`}>AdoptMe</span>
        </Link>

        {/* Secciones del rol. Hoy la lista está vacía: no se muestra nada. */}
        {enlaces.length > 0 && (
          <nav aria-label="Secciones" className="hidden lg:block">
            <ul className={`${nunito.className} flex gap-[100px] pb-3 text-2xl`}>
              {enlaces.map(({ href, texto }) => (
                <li key={href}>
                  <Link href={href} className={FOCO}>
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Menú de usuario: <details> se abre y se cierra sin JavaScript
            (clic, Enter o Espacio sobre el icono). */}
        <details className="relative shrink-0">
          <summary
            aria-label="Menú de usuario"
            className={`${FOCO} flex cursor-pointer list-none rounded-full [&::-webkit-details-marker]:hidden`}
          >
            <IconoUsuario />
          </summary>

          <div className="absolute top-full right-0 z-20 mt-3 w-48 rounded-lg bg-white p-2 text-black shadow-lg">
            {/* El formulario ejecuta la Server Action logout en el servidor.
                "tipo" solo indica qué pestaña mostrar después en el login. */}
            <form action={logout}>
              <input type="hidden" name="tipo" value={rol} />
              <SubmitButton
                pendingText="Cerrando sesión..."
                className={`${poppins.className} ${FOCO_MENU[rol]} w-full rounded-md px-3 py-2 text-left text-base hover:bg-[#F2F2F2]`}
              >
                Cerrar sesión
              </SubmitButton>
            </form>
          </div>
        </details>
      </div>

      {/* En móvil, las secciones van en una fila debajo que se desplaza en horizontal. */}
      {enlaces.length > 0 && (
        <nav aria-label="Secciones" className="overflow-x-auto px-4 pb-3 lg:hidden">
          <ul className={`${nunito.className} flex gap-6 whitespace-nowrap text-base`}>
            {enlaces.map(({ href, texto }) => (
              <li key={href}>
                <Link href={href} className={FOCO}>
                  {texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

// Persona dentro de un círculo, en contorno blanco, como en Figma.
function IconoUsuario() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.2"
      aria-hidden="true"
      className="size-8 shrink-0 lg:mb-2 lg:size-[42px]"
    >
      <circle cx="12" cy="12" r="10.5" />
      <circle cx="12" cy="9.5" r="3.5" />
      <path d="M5.5 19.2c1.4-2.6 3.8-4 6.5-4s5.1 1.4 6.5 4" />
    </svg>
  );
}
