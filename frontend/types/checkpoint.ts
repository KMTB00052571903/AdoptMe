// Tipos de Seguimiento para el frontend. Copian la entidad Checkpoint y el DTO
// ResponderCheckpointDto del backend (backend/src/tracking).

// Mismos valores que el enum EstadoCheckpoint del backend.
export type EstadoCheckpoint = "pendiente" | "respondido" | "vencido";

// Mismos valores que el enum TipoCheckpoint del backend.
export type TipoCheckpoint = "dia_30" | "dia_90";

// Cada elemento de GET /api/seguimiento/mis-checkpoints.
// Las fechas llegan como texto porque viajan en JSON.
export type Checkpoint = {
  id: string;
  solicitudId: string;
  tipo: TipoCheckpoint;
  fechaProgramada: string; // "YYYY-MM-DD"
  estado: EstadoCheckpoint;
  fechaRespuesta: string | null; // fecha y hora ISO; null si no se ha respondido
  comentario: string | null;
  fotoUrl: string | null;
};

// Body de PATCH /api/seguimiento/checkpoints/:id/responder.
// El estado y la fecha de respuesta los decide el servidor: no se envían.
export type ResponderCheckpointBody = {
  comentario: string;
  fotoUrl?: string; // URL de una foto ya publicada; AdoptMe no sube imágenes
};
