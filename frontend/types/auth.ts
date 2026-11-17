// Tipos de Auth para el frontend. Copian la forma de los datos que devuelve
// y espera NestJS (backend/src/auth). No validan nada: la validación real la
// hace el backend con sus DTO.

// Mismos valores que el enum RolUsuario del backend.
export type Rol = "adoptante" | "fundacion";

// Respuesta de POST /api/auth/login.
export type LoginResponse = {
  accessToken: string;
};

// Respuesta de GET /api/auth/perfil: la identidad que NestJS leyó del token.
// Una fundación solo trae fundacionId y un adoptante solo adoptanteId.
export type SessionUser = {
  id: string;
  email: string;
  rol: Rol;
  adoptanteId?: string;
  fundacionId?: string;
};

// Respuesta de POST /api/auth/registro/adoptante y /registro/fundacion.
export type UsuarioPublico = {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
};

// Body de POST /api/auth/registro/adoptante. El rol no se envía: lo decide la ruta.
export type RegistroAdoptanteBody = {
  nombre: string;
  email: string;
  password: string; // de 8 a 14 caracteres
  telefono: string;
  direccion: string;
  experienciaPrevia?: string;
};

// Body de POST /api/auth/registro/fundacion. El rol no se envía: lo decide la ruta.
export type RegistroFundacionBody = {
  nombre: string;
  email: string;
  password: string; // de 8 a 14 caracteres
  nombrePublico: string;
  descripcion: string;
  ciudad: string;
  telefonoContacto: string;
};
