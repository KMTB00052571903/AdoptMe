"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_COOKIE } from "./adoptme-api";

// Server Action de cierre de sesión. "use server" al inicio del archivo hace
// que todas sus funciones exportadas sean acciones de servidor, y así la
// cabecera de los dos roles puede usar la misma.
//
// No llama a NestJS: el backend no guarda sesiones, solo valida el JWT que
// recibe. Cerrar sesión es borrar la cookie donde el navegador guarda ese JWT.
export async function logout(formData: FormData) {
  // "tipo" solo elige la pestaña que se muestra en el login.
  // No decide permisos: la sesión se borra igual en los dos casos.
  const tipo = formData.get("tipo") === "fundacion" ? "fundacion" : "adoptante";

  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);

  redirect(`/login?tipo=${tipo}&logout=1`);
}
