// Estado de un checkpoint de seguimiento.
// pendiente -> respondido cuando el adoptante responde;
// pendiente -> vencido si pasa la fecha programada sin respuesta.
export enum EstadoCheckpoint {
  PENDIENTE = 'pendiente',
  RESPONDIDO = 'respondido',
  VENCIDO = 'vencido',
}