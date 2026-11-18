# D3 — F1 Animales (frontend)

Responsable: Isabella D'Otero. Rama: `feat/frontend-animals`.

## Pantallas

| URL | Quién la ve | Qué hace |
| --- | --- | --- |
| `/animals` | Cualquiera, sin sesión | Catálogo con filtros (especie, edad, tamaño) y paginación de 9 en 9 |
| `/adopter/animals/[id]` | Adoptante con sesión | Detalle del animal: foto, datos, ficha de salud y fundación |
| `/foundation/animals` | Fundación con sesión | Mis animales (todos los estados) y formulario para crear uno nuevo |
| `/foundation/animals/[id]` | Fundación con sesión | Editar, cambiar estado y eliminar (solo si el animal es suyo) |

## Cómo viajan los datos

1. **Lectura (Server Components).** `app/animals/page.tsx` llama a `fetchCatalog()` en `lib/animals-api.ts`, que hace `fetch` a `GET /api/animales` en el servidor de Next. El navegador nunca llama directo a la API.
2. **Filtros.** El hook `useAnimalFilters` (`hooks/use-animal-filters.ts`) guarda los filtros en la URL (`?species=dog&age=puppy`) con `router.replace`. Al cambiar la URL, la página se vuelve a renderizar en el servidor y traduce los filtros a los parámetros de la API (`especie`, `tamano`, `edadMinMeses`, `edadMaxMeses`).
3. **Escritura (Server Actions).** Los formularios de `components/animals/` llaman a las funciones de `app/foundation/animals/actions.ts` (`createAnimal`, `updateAnimal`, `updateAnimalStatus`, `deleteAnimal`). Cada una revisa el rol, llama a la API con el token y después usa `revalidatePath` para que la lista se actualice.

## Sesión y permisos

- El JWT se guarda en la cookie HttpOnly `adoptme_token` (1 hora). JavaScript del navegador no la puede leer.
- `apiFetch` (`lib/adoptme-api.ts`) agrega `Authorization: Bearer <token>` a cada llamada. Si la API responde 401, redirige a `/login?expired=1`.
- `requireRole("adoptante")` / `requireRole("fundacion")` protege cada página y cada Server Action: sin sesión manda a login, con otro rol no deja entrar.
- La API vuelve a revisar todo (Guards de JWT y de rol, y `assertBelongsToFoundation` para que una fundación solo toque sus animales). El frontend nunca manda `fundacionId`: sale del token.

## Manejo de errores y estados

| Situación | Qué se ve |
| --- | --- |
| Cargando | `loading.tsx` con tarjetas grises (`GridSkeleton`) |
| La API está apagada o falla | `error.tsx` con "No pudimos cargar..." y botón para reintentar |
| No hay animales con esos filtros | "No encontramos animales con esos filtros." con link a "Ver todos los animales" |
| El animal no existe o el id no es válido | Página 404 de Next (`notFound()`) |
| La API rechaza un formulario (400, 403, 409) | Los mensajes de la API en rojo arriba del formulario (`FormErrors`) |
| Acción exitosa | Aviso verde ("Animal publicado", "Información actualizada", "Estado actualizado", "Ficha eliminada") |

## Casos de prueba manuales

Datos del seed. Contraseña de todos: `AdoptMe2026!`.

| # | Caso | Pasos | Resultado esperado | ✓ |
| --- | --- | --- | --- | --- |
| 1 | Catálogo público | Abrir `localhost:3001/animals` sin iniciar sesión | Se ven los animales disponibles y en proceso con su foto; Nala (no disponible) no aparece | ✓ |
| 2 | Filtros | Elegir Especie: Gato y luego Edad: Joven | La URL cambia y solo quedan gatos jóvenes | ✓ |
| 3 | Sin resultados | Elegir una combinación sin animales (ej. Gato + Senior) | "No encontramos animales con esos filtros." | |
| 4 | Detalle sin sesión | Sin sesión, dar clic en "Ver" de un animal | Redirige a `/login` | ✓ |
| 5 | Detalle como adoptante | Entrar con `ana@adoptme.test` y abrir un animal | Se ven foto, datos, ficha de salud y fundación | ✓ |
| 6 | Mis animales | Entrar con `patitas@adoptme.test` y abrir "Mis animales" | Se ven solo los animales de Patitas, en todos los estados | ✓ |
| 7 | Crear animal | Llenar el formulario "Nuevo animal" y guardar | Aviso "Animal publicado" y el animal aparece en la lista y en el catálogo | ✓ |
| 8 | Crear con datos inválidos | Dejar la URL de la foto vacía o con un texto que no es URL | Mensaje de error y no se crea | | |
| 9 | Editar animal | Abrir un animal propio, cambiar el nombre (ej. "Rocco Jr") y guardar | Aviso "Información actualizada" y el nombre nuevo en la lista | ✓ |
| 10 | Cambiar estado | En un animal disponible, marcar "No disponible" | Aviso "Estado actualizado" y el animal desaparece del catálogo público | | |
| 11 | Eliminar sin solicitudes | Eliminar un animal recién creado y confirmar | Aviso "Ficha eliminada" y ya no está en la lista | ✓ |
| 12 | Eliminar con solicitudes (409) | Intentar eliminar a Luna (en proceso) | Mensaje en rojo de la API y Luna no se borra | ✓ |
| 13 | Animal de otra fundación | Como Patitas, abrir el detalle de un animal de Huellitas | Aviso "Este animal pertenece a otra fundación" y solo información, sin formulario ni botones | | |
| 14 | API apagada | Detener la API y recargar `/animals` | Pantalla "No pudimos cargar el catálogo" con botón de reintentar | ✓ |
| 15 | Menú por rol | Entrar como fundación y como adoptante | La cabecera muestra "Mis animales" o "Catálogo" según el rol | ✓ |

## Decisiones y problemas

| Decisión o problema | Por qué / cómo se resolvió |
| --- | --- |
| La foto se carga como URL, no como archivo | La API recibe `fotos: string[]` desde el D2. Subir archivos necesitaría un servicio de almacenamiento que está fuera del alcance del D3. Al editar no se cambia la foto. |
| Nuevo endpoint `GET /animales/mine` | El catálogo público solo muestra animales disponibles o en proceso, pero la fundación necesita ver también los adoptados y no disponibles. El id de la fundación sale del token. |
| El detalle `GET /animales/:id` ahora pide sesión | El equipo acordó que el catálogo es público pero el detalle es solo para usuarios con sesión (así lo muestra el Figma). |
| La edad se elige por categorías (Cachorro, Joven, Adulto, Senior) | Es más fácil para el usuario que escribir meses. El frontend las traduce a `edadMinMeses`/`edadMaxMeses` para filtrar y a un número de meses típico al crear. Al editar, la edad solo se manda si se cambió de categoría, para no perder el valor exacto. |
| Campos extra en el formulario (sexo, descripción, vacunado, esterilizado) | La API los exige para crear un animal y la ficha de salud, aunque el Figma no los tenía todos. |
| Código en inglés | El profesor pidió código en inglés: archivos, clases, métodos y variables se renombraron. Las rutas de la API (`/animales`) y los campos JSON (`nombre`, `especie`) siguen en español para no romper el contrato ni la base de datos. |
| Fotos rotas del seed | El seed usaba imágenes de relleno; se cambiaron por fotos reales de perros y gatos. |
| La foto del detalle salía cortada y las tarjetas desalineadas | Se limitó la altura de la foto a la pantalla y se igualó la altura de las tarjetas. |
| "No pudimos cargar el catálogo" mientras se trabajaba | La API se apagaba al escribir comandos de git en su terminal. Se usan tres terminales separadas (ver README). |
