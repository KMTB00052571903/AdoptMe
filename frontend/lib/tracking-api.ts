import "server-only";
import { apiFetch } from "./adoptme-api";
import type { Checkpoint } from "../types/checkpoint";

// Resultado de consultar los checkpoints del adoptante de la sesión.
// "permiso": NestJS respondió 403 (el token no identifica a un adoptante).
// "consulta": la API no respondió o no devolvió una lista.
export type ResultadoCheckpoints =
  | { checkpoints: Checkpoint[]; error: null }
  | { checkpoints: null; error: "permiso" | "consulta" };

// GET /api/seguimiento/mis-checkpoints con el JWT de la cookie.
// Si el token venció (401), apiFetch ya redirige a /login?expired=1.
export async function getMisCheckpoints(): Promise<ResultadoCheckpoints> {
  const response = await apiFetch("/seguimiento/mis-checkpoints");
  if (response?.status === 403) return { checkpoints: null, error: "permiso" };

  const data = response?.ok ? await response.json().catch(() => null) : null;
  if (!Array.isArray(data)) return { checkpoints: null, error: "consulta" };

  return { checkpoints: data, error: null };
}
