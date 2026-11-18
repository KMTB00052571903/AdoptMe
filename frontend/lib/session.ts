import "server-only";
import { redirect } from "next/navigation";
import { apiFetch } from "./adoptme-api";
import { PANEL_POR_ROL } from "./routes";
import type { Rol, SessionUser } from "../types/auth";

// Pregunta a NestJS quién es el usuario de la sesión (GET /api/auth/perfil).
// El rol sale del JWT que NestJS ya validó, nunca de la URL ni del formulario.
// Si no se puede confirmar la identidad, devuelve null.
export async function getSessionUser(): Promise<SessionUser | null> {
  const response = await apiFetch("/auth/perfil");
  if (!response?.ok) return null;

  const user = await response.json().catch(() => null);
  if (typeof user?.id !== "string" || !user.id) return null;
  if (typeof user.email !== "string" || !user.email) return null;
  if (user.rol !== "adoptante" && user.rol !== "fundacion") return null;
  return user;
}

// Exige un rol para ver una página o ejecutar una Server Action.
// Es una ayuda para la interfaz: la protección real son los guards de NestJS.
export async function requireRole(rol: Rol): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Rol equivocado: vuelve a SU propio panel con un aviso. Su panel siempre
  // le está permitido, así que no se produce un bucle de redirecciones.
  if (user.rol !== rol) redirect(`${PANEL_POR_ROL[user.rol]}?aviso=sin-permiso`);

  return user;
}
