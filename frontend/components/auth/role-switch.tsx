import Link from "next/link";
import type { Rol } from "../../types/auth";

type RoleSwitchProps = {
  active: Rol;
  className?: string; // tipografía de las pestañas, la decide la página
};

const PESTANAS: { rol: Rol; texto: string }[] = [
  { rol: "adoptante", texto: "Adoptante" },
  { rol: "fundacion", texto: "Fundación" },
];

// Pestañas Adoptante / Fundación del login. Son enlaces: la pestaña elegida
// viaja en la URL (?tipo=...), igual que los filtros de la clase 3.
// Solo cambian el aspecto de la pantalla. NO dan permisos: el rol real lo
// decide NestJS al iniciar sesión.
export default function RoleSwitch({ active, className = "" }: RoleSwitchProps) {
  return (
    <nav aria-label="Tipo de cuenta" className={`grid grid-cols-2 ${className}`}>
      {PESTANAS.map(({ rol, texto }) => {
        const activa = rol === active;
        return (
          <Link
            key={rol}
            href={`/login?tipo=${rol}`}
            aria-current={activa ? "page" : undefined}
            className={`py-4 text-center text-xl text-[#9E9E9E] lg:py-6 lg:text-2xl ${
              activa ? "bg-white" : "bg-[#E5E5E5] hover:bg-[#DADADA]"
            }`}
          >
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
