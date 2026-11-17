// Forma del cuerpo de error que devuelve NestJS (400, 401, 403, 404, 409...).
// Cuando falla la validación de un DTO, message es una lista de textos;
// en los demás casos es un solo texto.
export type ApiError = {
  statusCode: number;
  message: string | string[];
  error?: string;
};
