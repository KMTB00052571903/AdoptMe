// Estado de adopción del animal. Transiciones acordadas (las aplicarán los servicios):
// disponible -> en_proceso al recibir la primera solicitud pendiente;
// en_proceso -> adoptado al aprobar una solicitud;
// en_proceso -> disponible si se rechazan todas y no quedan pendientes;
// no_disponible lo establece manualmente la fundación.
export enum EstadoAnimal {
  DISPONIBLE = 'disponible',
  EN_PROCESO = 'en_proceso',
  ADOPTADO = 'adoptado',
  NO_DISPONIBLE = 'no_disponible',
}
