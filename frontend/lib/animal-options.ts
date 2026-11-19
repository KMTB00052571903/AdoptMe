import type { AnimalStatus, Sex, Size, Species } from "../types/animal";

// Textos y opciones de Animales que usan varias pantallas (catálogo, detalle
// y formularios). Se definen una sola vez para que todas digan lo mismo.

export const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: "gato", label: "Gato" },
  { value: "perro", label: "Perro" },
];

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "hembra", label: "Hembra" },
  { value: "macho", label: "Macho" },
];

export const SIZE_OPTIONS: { value: Size; label: string }[] = [
  { value: "pequeno", label: "Pequeño" },
  { value: "mediano", label: "Mediano" },
  { value: "grande", label: "Grande" },
];

export const STATUS_LABELS: Record<AnimalStatus, string> = {
  disponible: "Disponible",
  en_proceso: "En proceso",
  adoptado: "Adoptado",
  no_disponible: "No disponible",
};

// El Figma usa categorías de edad; la API guarda la edad en meses.
// Cada categoría tiene un rango (para filtrar) y un valor típico (para crear).
export type AgeCategory = "puppy" | "young" | "adult" | "senior";

export const AGE_OPTIONS: {
  value: AgeCategory;
  label: string;
  minMonths?: number;
  maxMonths?: number;
  typicalMonths: number;
}[] = [
  { value: "puppy", label: "Cachorro (0 - 1 año)", maxMonths: 12, typicalMonths: 6 },
  { value: "young", label: "Joven (1 - 3 años)", minMonths: 13, maxMonths: 36, typicalMonths: 24 },
  { value: "adult", label: "Adulto (3 - 7 años)", minMonths: 37, maxMonths: 84, typicalMonths: 60 },
  { value: "senior", label: "Senior (7+ años)", minMonths: 85, typicalMonths: 96 },
];

// Meses -> categoría, para mostrar "Adulto" en las tarjetas y marcar el radio al editar.
export function ageCategoryOf(months: number): AgeCategory {
  if (months <= 12) return "puppy";
  if (months <= 36) return "young";
  if (months <= 84) return "adult";
  return "senior";
}

export function ageLabel(months: number): string {
  const short: Record<AgeCategory, string> = {
    puppy: "Cachorro",
    young: "Joven",
    adult: "Adulto",
    senior: "Senior",
  };
  return short[ageCategoryOf(months)];
}

export function labelOf<T extends string>(options: { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
