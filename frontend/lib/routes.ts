import type { Rol } from "../types/auth";

// Destino de cada rol después de iniciar sesión.
// PROVISIONAL: según los UserFlows, el adoptante va a su panel y la fundación
// al panel principal de la fundación, pero sus URLs aún no están acordadas
// con el equipo. Mientras tanto, los dos roles van a "/".
// Cuando se confirmen, solo hay que cambiar estas dos líneas.
export const PANEL_POR_ROL: Record<Rol, string> = {
  adoptante: "/",
  fundacion: "/",
};
