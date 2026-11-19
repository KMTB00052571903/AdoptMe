import { Fredoka, Nunito, Poppins } from "next/font/google";

// Tipografías del diseño de Figma para las pantallas de Auth (login y registro).
// Se declaran una sola vez aquí y cada pantalla importa las que necesita.
// No se cargan en layout.tsx para no cambiar las pantallas del resto del equipo.
export const fredoka = Fredoka({ weight: "700", subsets: ["latin"] }); // "AdoptMe"
export const nunito = Nunito({ weight: "800", subsets: ["latin"] }); // títulos, pestañas, botones
export const poppins = Poppins({ weight: "400", subsets: ["latin"] }); // etiquetas y textos
