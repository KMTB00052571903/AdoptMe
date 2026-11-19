import "server-only";
import { notFound } from "next/navigation";
import { apiFetch } from "./adoptme-api";
import type { Animal } from "../types/animal";

// Detalle de un animal: GET /api/animales/:id ahora pide sesión, por eso va
// con apiFetch (agrega el token y manda al login si responde 401).
// 400 (id que no es UUID) o 404 -> página "no encontrado".
// Otro error -> se lanza y lo muestra el error.tsx de la ruta.
export async function fetchAnimal(id: string): Promise<Animal> {
  const response = await apiFetch(`/animales/${id}`);
  if (response?.status === 400 || response?.status === 404) notFound();
  if (!response?.ok) throw new Error(`El detalle respondió ${response?.status ?? "sin conexión"}`);
  return response.json();
}
