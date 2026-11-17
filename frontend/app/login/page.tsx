import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthShell from "../../components/auth/auth-shell";
import { nunito } from "../../components/auth/fonts";
import RoleSwitch from "../../components/auth/role-switch";
import { ESTILOS_ROL } from "../../components/auth/role-styles";
import FormAlert from "../../components/form-alert";
import SubmitButton from "../../components/submit-button";
import { getApiUrl } from "../../lib/api-config";
import { TOKEN_COOKIE } from "../../lib/adoptme-api";
import { PANEL_POR_ROL } from "../../lib/routes";
import type { Rol } from "../../types/auth";

// Server Action: se ejecuta en el servidor de Next.js al enviar el formulario.
async function login(formData: FormData) {
  "use server";

  // La pestaña elegida solo sirve para volver a ella si hay un error.
  // No se envía a NestJS y no decide el rol.
  const tipo = formData.get("tipo") === "fundacion" ? "fundacion" : "adoptante";
  const volver = `/login?tipo=${tipo}`;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // 1. Enviar las credenciales a NestJS. El LoginDto solo acepta email y password.
  const response = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).catch(() => null);

  if (response?.status === 401) redirect(`${volver}&error=credenciales`);
  if (response?.status === 400) redirect(`${volver}&error=datos`);
  if (!response?.ok) redirect(`${volver}&error=conexion`);

  const data = await response.json().catch(() => null);
  const token = data?.accessToken;
  if (typeof token !== "string" || !token) redirect(`${volver}&error=conexion`);

  // 2. Preguntar a NestJS el rol real de esta cuenta con el token recién recibido.
  const perfil = await fetch(`${getApiUrl()}/auth/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  const user = perfil?.ok ? await perfil.json().catch(() => null) : null;
  const rol = user?.rol;
  if (rol !== "adoptante" && rol !== "fundacion") {
    redirect(`${volver}&error=conexion`);
  }

  // 3. Guardar el JWT en una cookie HttpOnly: el JavaScript del navegador no
  //    puede leerla. maxAge = 1 hora, la misma duración que el token de NestJS.
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  // 4. Ir al destino del rol que dijo NestJS, no al de la pestaña elegida.
  redirect(PANEL_POR_ROL[rol as Rol]);
}

const MENSAJES_ERROR: Record<string, string> = {
  credenciales: "Email o contraseña incorrectos.",
  datos: "Revisa el formato del email y la contraseña.",
  conexion: "No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.",
};

type LoginPageProps = {
  searchParams: Promise<{
    tipo?: string;
    error?: string;
    expired?: string;
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { tipo, error, expired, registered } = await searchParams;
  const rol: Rol = tipo === "fundacion" ? "fundacion" : "adoptante";
  const estilo = ESTILOS_ROL[rol];
  const mensajeError = error ? MENSAJES_ERROR[error] : undefined;

  return (
    <AuthShell rol={rol}>
      <RoleSwitch active={rol} className={nunito.className} />

      <div className="px-6 pt-6 pb-8 lg:px-9 lg:pt-8">
        <h1
          className={`${nunito.className} text-center text-[28px] leading-tight text-black lg:text-4xl`}
        >
          ¡Bienvenido a AdoptMe!
        </h1>

        {expired === "1" && !mensajeError && (
          <FormAlert variant="warning" className="mt-4">
            Tu sesión venció. Inicia sesión de nuevo.
          </FormAlert>
        )}
        {mensajeError && (
          <FormAlert variant="error" className="mt-4">
            {mensajeError}
          </FormAlert>
        )}
        {registered === "1" && !mensajeError && expired !== "1" && (
          <FormAlert variant="success" className="mt-4">
            Cuenta creada. Ya puedes iniciar sesión.
          </FormAlert>
        )}

        <form action={login} className="mt-5 flex flex-col gap-5">
          <input type="hidden" name="tipo" value={rol} />

          <label className="flex flex-col gap-2 text-base text-black">
            E-mail
            <span className="flex h-[60px]">
              <span className={`${estilo.fondo} flex w-12 shrink-0 items-center justify-center rounded-l-lg lg:w-[60px]`}>
                <IconoSobre />
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={128}
                placeholder="Insertar E-mail..."
                className={`${estilo.foco} min-w-0 flex-1 rounded-r-lg border-2 border-l-0 border-[#BDBDBD] bg-[#F7F7F7] px-3 text-black placeholder:text-[#9E9E9E] focus:outline-none`}
              />
            </span>
          </label>

          <label className="flex flex-col gap-2 text-base text-black">
            Contraseña
            <span className="flex h-[60px]">
              <span className={`${estilo.fondo} flex w-12 shrink-0 items-center justify-center rounded-l-lg lg:w-[60px]`}>
                <IconoCandado />
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                placeholder="Insertar Contraseña..."
                className={`${estilo.foco} min-w-0 flex-1 rounded-r-lg border-2 border-l-0 border-[#BDBDBD] bg-[#F7F7F7] px-3 text-black placeholder:text-[#9E9E9E] focus:outline-none`}
              />
            </span>
          </label>

          <SubmitButton
            pendingText="Ingresando..."
            className={`${nunito.className} ${estilo.fondo} mx-auto mt-2 h-[60px] w-full max-w-[185px] rounded-xl text-white lg:h-[70px]`}
          >
            Iniciar sesión
          </SubmitButton>
        </form>

        {/* Según Figma y el UserFlow, solo el adoptante puede registrarse. */}
        {rol === "adoptante" && (
          <p className="mt-6 text-center text-sm text-[#757575]">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className={`${estilo.texto} font-semibold underline`}>
              Registrarme.
            </Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
}

// Iconos de contorno del diseño, en SVG para no instalar una librería de iconos.
function IconoSobre() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconoCandado() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
