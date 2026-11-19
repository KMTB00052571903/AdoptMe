// Estado de una solicitud de adopción.
// pendiente -> aprobada | rechazada (lo decide la fundación).
// Al aprobar una, las demás pendientes del mismo animal pasan a cerrada_por_otra_adopcion.
export enum EstadoSolicitud {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  CERRADA_POR_OTRA_ADOPCION = 'cerrada_por_otra_adopcion',
}