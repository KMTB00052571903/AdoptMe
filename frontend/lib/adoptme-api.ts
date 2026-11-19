import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "./api-config";

// Nombre de la cookie HttpOnly donde se guarda el JWT de la sesión.
// Login, logout y este helper usan la misma constante.
export const TOKEN_COOKIE = "adoptme_token";

// Lee el JWT de la cookie. Sin cookie, vuelve al login antes de llamar a la API.
// Que la cookie exista no demuestra que el JWT sea válido: eso lo decide NestJS.
export async function requireToken() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) redirect("/login");
  return token;
}

// Petición privada a NestJS: agrega "Authorization: Bearer <token>".
// Si NestJS responde 401 (token vencido o inválido), vuelve al login con aviso.
// Los demás códigos (400, 403, 404, 409...) los decide la página que llama.
// Se usa .catch() y no try/catch para no atrapar el redirect().
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await requireToken();
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  }).catch(() => null);

  if (response?.status === 401) redirect("/login?expired=1");
  return response;
}
