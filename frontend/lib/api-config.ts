import "server-only";

// Devuelve la URL base de la API de NestJS, por ejemplo
// "http://localhost:3000/api". Se lee de ADOPTME_API_URL en .env.local.
// La variable no lleva el prefijo NEXT_PUBLIC_: solo existe en el servidor
// de Next.js, que es quien habla con NestJS. El navegador no la necesita.
export function getApiUrl(): string {
  const url = process.env.ADOPTME_API_URL;
  if (!url) {
    throw new Error(
      "Falta ADOPTME_API_URL. Copia .env.example como .env.local y reinicia Next.js.",
    );
  }
  // Sin barra final, para poder escribir `${getApiUrl()}/auth/login`.
  return url.replace(/\/+$/, "");
}
