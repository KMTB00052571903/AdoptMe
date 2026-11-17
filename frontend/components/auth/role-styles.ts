import type { Rol } from "../../types/auth";

// Colores y logo de cada rol en las pantallas de Auth.
// Las clases de Tailwind se escriben completas porque Tailwind solo genera
// las clases que encuentra escritas tal cual en el código.
// "foco" pinta el borde de un campo con el color del rol cuando está enfocado,
// para que se vea qué campo está activo al navegar con Tab.
export const ESTILOS_ROL: Record<
  Rol,
  { fondo: string; texto: string; foco: string; logo: string }
> = {
  adoptante: {
    fondo: "bg-[#4D70E6]",
    texto: "text-[#4D70E6]",
    foco: "focus-visible:border-[#4D70E6]",
    logo: "/logo-adoptante.png",
  },
  fundacion: {
    fondo: "bg-[#005595]",
    texto: "text-[#005595]",
    foco: "focus-visible:border-[#005595]",
    logo: "/logo-fundacion.png",
  },
};
