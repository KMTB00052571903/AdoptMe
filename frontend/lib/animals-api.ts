import "server-only";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "./adoptme-api";
import { getApiUrl } from "./api-config";
import type { ApiError } from "../types/api-error";
import type { AnimalPage } from "../types/animal";
import type { SessionUser } from "../types/auth";

// Catálogo público: GET /api/animales no pide token, así que se llama sin
// apiFetch (apiFetch manda al login si no hay sesión).
// Si la API falla, se lanza un error y lo muestra app/animals/error.tsx.
export async function fetchCatalog(query: URLSearchParams): Promise<AnimalPage> {
  const response = await fetch(`${getApiUrl()}/animales?${query}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`El catálogo respondió ${response.status}`);
  }
  return response.json();
}

// Usuario de la sesión SI la hay, sin redirigir: el catálogo es público y
// solo lo usa para elegir la cabecera y a qué detalle llevan las tarjetas.
export async function getOptionalUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  const response = await fetch(`${getApiUrl()}/auth/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) return null;
  return response.json().catch(() => null);
}

// Convierte la respuesta de error de NestJS en textos para mostrar en pantalla.
// En un 400 de validación "message" es una lista; en 403, 404 y 409 es un texto.
export async function readApiErrors(response: Response | null): Promise<string[]> {
  if (!response) return ["No se pudo conectar con el servidor. Inténtalo de nuevo."];
  const body = (await response.json().catch(() => null)) as ApiError | null;
  if (Array.isArray(body?.message)) return body.message;
  if (typeof body?.message === "string") return [body.message];
  return [`El servidor respondió ${response.status}.`];
}
