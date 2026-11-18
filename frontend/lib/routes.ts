import type { Rol } from "../types/auth";

// Panel de cada rol: destino después de iniciar sesión y adonde vuelve
// un usuario que intenta abrir una página de otro rol.
// Rutas acordadas con el equipo (UserFlows de Adoptante y Fundación).
export const PANEL_POR_ROL: Record<Rol, string> = {
  adoptante: "/adopter",
  fundacion: "/foundation",
};

export type EnlaceNav = {
  href: string; // ruta de la sección, por ejemplo "/adopter/tracking"
  texto: string; // texto visible en la cabecera
};

// Secciones que muestra la cabecera de cada rol, en el orden del UserFlow.
// Solo se agregan páginas que YA existen, para no mostrar enlaces que den 404.
// Cada responsable añade aquí su sección cuando su página esté lista.
export const NAV_POR_ROL: Record<Rol, EnlaceNav[]> = {
  adoptante: [],
  fundacion: [],
};
