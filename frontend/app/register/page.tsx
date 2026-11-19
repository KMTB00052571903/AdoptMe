import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "../../components/auth/auth-shell";
import { nunito } from "../../components/auth/fonts";
import { ESTILOS_ROL } from "../../components/auth/role-styles";
import FormAlert from "../../components/form-alert";
import SubmitButton from "../../components/submit-button";
import { getApiUrl } from "../../lib/api-config";
import type { RegistroAdoptanteBody } from "../../types/auth";

// Según el UserFlow, solo los adoptantes se registran desde la app.
// El registro de fundaciones existe en el backend, pero queda pendiente
// de confirmar con el equipo.
const estilo = ESTILOS_ROL.adoptante;

// Server Action: se ejecuta en el servidor de Next.js al enviar el formulario.
async function register(formData: FormData) {
  "use server";

  // Lee un campo del formulario como texto y quita los espacios de los extremos.
  const texto = (campo: string) => String(formData.get(campo) ?? "").trim();

  // Solo los campos del RegistroAdoptanteDto. El rol no se envía:
  // lo decide la ruta /auth/registro/adoptante del backend.
  const body: RegistroAdoptanteBody = {
    nombre: texto("nombre"),
    email: texto("email"),
    password: String(formData.get("password") ?? ""), // la contraseña no se recorta
    telefono: texto("telefono"),
    direccion: texto("direccion"),
  };
  // Opcional: si está vacía no se envía; si se enviara "", el backend la guardaría así.
  const experiencia = texto("experienciaPrevia");
  if (experiencia) body.experienciaPrevia = experiencia;

  const response = await fetch(`${getApiUrl()}/auth/registro/adoptante`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (response?.status === 409) redirect("/register?error=email");
  if (response?.status === 400) redirect("/register?error=datos");
  if (response?.status !== 201) redirect("/register?error=conexion");

  // Registrarse no devuelve un token: no se guarda ninguna cookie.
  // La persona inicia sesión después, desde el login.
  redirect("/login?tipo=adoptante&registered=1");
}

const MENSAJES_ERROR: Record<string, string> = {
  email: "Ese email ya tiene una cuenta. Inicia sesión o usa otro email.",
  datos:
    "Revisa los datos: los campos con * son obligatorios y la contraseña debe tener entre 8 y 14 caracteres.",
  conexion: "No se pudo crear la cuenta. Revisa tu conexión e inténtalo de nuevo.",
};

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;
  const mensajeError = error ? MENSAJES_ERROR[error] : undefined;

  return (
    <AuthShell rol="adoptante">
      <div className="px-6 pt-6 pb-8 lg:px-9 lg:pt-8">
        <h1
          className={`${nunito.className} text-center text-[28px] leading-tight text-black lg:text-4xl`}
        >
          Crea tu cuenta
        </h1>

        {mensajeError && (
          <FormAlert variant="error" className="mt-4">
            {mensajeError}
          </FormAlert>
        )}

        <form action={register} className="mt-5 flex flex-col gap-4">
          <Campo etiqueta="Nombre" name="nombre" autoComplete="name" placeholder="Insertar nombre..." />
          <Campo
            etiqueta="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Insertar E-mail..."
          />
          <Campo
            etiqueta="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={14}
            placeholder="Insertar Contraseña..."
            ayuda="Entre 8 y 14 caracteres."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Campo
              etiqueta="Teléfono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              placeholder="Insertar teléfono..."
            />
            <Campo
              etiqueta="Dirección"
              name="direccion"
              autoComplete="street-address"
              placeholder="Insertar dirección..."
            />
          </div>

          <label className="flex flex-col gap-2 text-base text-black">
            Experiencia previa con mascotas (opcional)
            <textarea
              name="experienciaPrevia"
              rows={3}
              placeholder="Cuéntanos si has tenido mascotas antes..."
              className={`${estilo.foco} resize-y rounded-lg border-2 border-[#BDBDBD] bg-[#F7F7F7] px-3 py-2 text-black placeholder:text-[#9E9E9E] focus:outline-none`}
            />
          </label>

          <SubmitButton
            pendingText="Creando cuenta..."
            className={`${nunito.className} ${estilo.fondo} mx-auto mt-2 h-[60px] w-full max-w-[185px] rounded-xl text-white lg:h-[70px]`}
          >
            Crear cuenta
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-[#757575]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login?tipo=adoptante" className={`${estilo.texto} font-semibold underline`}>
            Iniciar sesión.
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

type CampoProps = {
  etiqueta: string;
  name: string;
  type?: "text" | "email" | "password" | "tel";
  autoComplete: string;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  ayuda?: string; // texto pequeño debajo del campo
};

// Campo obligatorio del formulario: etiqueta con asterisco rojo e input con
// el mismo estilo que los campos del login.
function Campo({
  etiqueta,
  name,
  type = "text",
  autoComplete,
  placeholder,
  minLength,
  maxLength,
  ayuda,
}: CampoProps) {
  const idAyuda = ayuda ? `${name}-ayuda` : undefined;

  return (
    <label className="flex flex-col gap-2 text-base text-black">
      <span>
        {etiqueta}
        <span className="text-[#E5484D]" aria-hidden="true">
          *
        </span>
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-describedby={idAyuda}
        className={`${estilo.foco} h-[52px] min-w-0 rounded-lg border-2 border-[#BDBDBD] bg-[#F7F7F7] px-3 text-black placeholder:text-[#9E9E9E] focus:outline-none`}
      />
      {ayuda && (
        <span id={idAyuda} className="text-sm text-[#757575]">
          {ayuda}
        </span>
      )}
    </label>
  );
}
