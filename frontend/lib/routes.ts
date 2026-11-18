import type { Rol } from "../types/auth";

// Panel de cada rol: destino después de iniciar sesión y adonde vuelve
// un usuario que intenta abrir una página de otro rol.
// Rutas acordadas con el equipo (UserFlows de Adoptante y Fundación).
export const PANEL_POR_ROL: Record<Rol, string> = {
  adoptante: "/adopter",
  fundacion: "/foundation",
};
