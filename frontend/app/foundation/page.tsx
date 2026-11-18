import { nunito, poppins } from "../../components/auth/fonts";
import FormAlert from "../../components/form-alert";
import { requireRole } from "../../lib/session";

type FoundationPanelProps = {
  searchParams: Promise<{ aviso?: string }>;
};

// Panel de la fundación (UserFlow: "Panel principal de la fundación").
// Primero se comprueba la sesión y el rol con NestJS:
// - sin sesión o token vencido -> /login
// - un adoptante -> vuelve a /adopter con aviso
export default async function FoundationPanelPage({ searchParams }: FoundationPanelProps) {
  const user = await requireRole("fundacion");
  const { aviso } = await searchParams;

  return (
    <main className={`${poppins.className} min-h-screen bg-white px-4 py-10 text-black`}>
      <div className="mx-auto max-w-5xl">
        <h1 className={`${nunito.className} text-[28px] text-[#005595] lg:text-4xl`}>
          Panel de la fundación
        </h1>
        <p className="mt-2 text-base">
          Hola, <span className="font-semibold">{user.email}</span>
        </p>

        {aviso === "sin-permiso" && (
          <FormAlert variant="warning" className="mt-6 max-w-xl">
            No tienes permiso para ver esa página.
          </FormAlert>
        )}
      </div>
    </main>
  );
}
