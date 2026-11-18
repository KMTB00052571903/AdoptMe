"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "../../../lib/adoptme-api";
import { AGE_OPTIONS } from "../../../lib/animal-options";
import { readApiErrors } from "../../../lib/animals-api";
import { requireRole } from "../../../lib/session";

// Server Actions de Animales: corren en el servidor de Next.js, que es quien
// tiene la cookie con el token y habla con NestJS. El navegador nunca ve el JWT.
// requireRole es ayuda de interfaz; la protección real son los guards de NestJS.

// Estado que devuelven a los formularios (useActionState): los errores que
// respondió el backend (400 de validación, 403, 409...) para mostrarlos.
export type FormState = { errors: string[] };

const JSON_HEADERS = { "Content-Type": "application/json" };

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function monthsFor(category: string): number | undefined {
  return AGE_OPTIONS.find((option) => option.value === category)?.typicalMonths;
}

// Fecha de hoy en Colombia en formato ISO (2026-11-18), para fechaIngreso.
function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

// POST /api/animales. La fundación NO se manda: NestJS la saca del token.
export async function createAnimal(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireRole("fundacion");

  const body = {
    nombre: text(formData, "name"),
    especie: text(formData, "species"),
    sexo: text(formData, "sex"),
    edadAproximadaMeses: monthsFor(text(formData, "age")),
    tamano: text(formData, "size"),
    descripcion: text(formData, "description"),
    fechaIngreso: todayInBogota(),
    fotos: [text(formData, "photoUrl")],
    fichaSalud: {
      vacunasAlDia: formData.get("vaccinated") === "on",
      esterilizado: formData.get("sterilized") === "on",
    },
  };

  const response = await apiFetch("/animales", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!response?.ok) return { errors: await readApiErrors(response) };

  revalidatePath("/foundation/animals");
  redirect("/foundation/animals?notice=created");
}

// PATCH /api/animales/:id (Figma: "Actualizar información").
// Solo se manda la edad si cambió de categoría, para no pisar los meses exactos.
export async function updateAnimal(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("fundacion");

  const age = text(formData, "age");
  const body = {
    nombre: text(formData, "name"),
    especie: text(formData, "species"),
    tamano: text(formData, "size"),
    ...(age !== text(formData, "currentAge") && { edadAproximadaMeses: monthsFor(age) }),
  };

  const response = await apiFetch(`/animales/${id}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!response?.ok) return { errors: await readApiErrors(response) };

  revalidatePath("/foundation/animals");
  redirect(`/foundation/animals/${id}?notice=updated`);
}

// PATCH /api/animales/:id/estado. A mano solo disponible <-> no_disponible:
// si no se permite, NestJS responde 409 y se muestra su mensaje.
export async function updateAnimalStatus(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("fundacion");

  const response = await apiFetch(`/animales/${id}/estado`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ estado: text(formData, "status") }),
  });
  if (!response?.ok) return { errors: await readApiErrors(response) };

  revalidatePath("/foundation/animals");
  redirect(`/foundation/animals/${id}?notice=status`);
}

// DELETE /api/animales/:id (Figma: "Eliminar ficha"). Con solicitudes -> 409.
export async function deleteAnimal(id: string): Promise<FormState> {
  await requireRole("fundacion");

  const response = await apiFetch(`/animales/${id}`, { method: "DELETE" });
  if (!response?.ok) return { errors: await readApiErrors(response) };

  revalidatePath("/foundation/animals");
  redirect("/foundation/animals?notice=deleted");
}
