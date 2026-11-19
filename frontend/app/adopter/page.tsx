import { nunito, poppins } from "../../components/auth/fonts";
import FormAlert from "../../components/form-alert";
import { requireRole } from "../../lib/session";

type AdopterPanelProps = {
  searchParams: Promise<{ aviso?: string }>;
};

// Panel del adoptante (UserFlow: "Panel del adoptante").
// Primero se comprueba la sesión y el rol con NestJS:
// - sin sesión o token vencido -> /login
// - una fundación -> vuelve a /foundation con aviso
export default async function AdopterPanelPage({ searchParams }: AdopterPanelProps) {
  const user = await requireRole("adoptante");
  const { aviso } = await searchParams;

  return (
    <main className={`${poppins.className} flex-1 bg-white px-4 py-10 text-black`}>
      <div className="mx-auto max-w-5xl">
        <h1 className={`${nunito.className} text-[28px] text-[#4D70E6] lg:text-4xl`}>
          Panel del adoptante
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
