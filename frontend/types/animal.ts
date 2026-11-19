// Tipos de Animales para el frontend. Copian la forma de los datos que
// devuelve NestJS (backend/src/animals). Los nombres de los campos son los
// del JSON de la API; no validan nada: la validación real la hacen los DTO.

export type Species = "perro" | "gato";
export type Sex = "macho" | "hembra";
export type Size = "pequeno" | "mediano" | "grande";
export type AnimalStatus = "disponible" | "en_proceso" | "adoptado" | "no_disponible";

export type AnimalPhoto = {
  id: string;
  url: string;
  orden: number; // 1 = foto principal
};

export type HealthRecord = {
  vacunasAlDia: boolean;
  esterilizado: boolean;
  condicionesMedicas: string | null;
};

export type Foundation = {
  id: string;
  nombrePublico: string;
  ciudad: string;
  telefonoContacto: string;
};

// Respuesta de GET /api/animales/:id (el catálogo y "mis animales" traen menos relaciones).
export type Animal = {
  id: string;
  fundacionId: string;
  nombre: string;
  especie: Species;
  sexo: Sex;
  razaAproximada: string | null;
  edadAproximadaMeses: number;
  tamano: Size;
  estado: AnimalStatus;
  descripcion: string;
  fechaIngreso: string;
  fotos: AnimalPhoto[];
  fichaSalud?: HealthRecord;
  fundacion?: Foundation;
};

// Respuesta paginada de GET /api/animales (catálogo).
export type AnimalPage = {
  data: Animal[];
  total: number;
  page: number;
  limit: number;
};
