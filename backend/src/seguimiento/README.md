# Seguimiento: checkpoints de 30 y 90 días

Cada adopción aprobada tiene dos checkpoints (`dia_30` y `dia_90`) que el
adoptante responde con un comentario y, si quiere, la URL de una foto.

## Rutas (solo adoptantes)

Todas llevan `JwtAuthGuard` + `RolesGuard` + `@Roles(RolUsuario.ADOPTANTE)`.
El dueño sale siempre de `req.user.adoptanteId` (token), nunca del cliente.

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | `/seguimiento/mis-checkpoints` | — | 200 lista de checkpoints propios, por `fechaProgramada` |
| PATCH | `/seguimiento/checkpoints/:id/responder` | `{ comentario, fotoUrl? }` | 200 checkpoint `respondido` |

| Caso | Código |
|---|---|
| Sin token o token inválido | 401 |
| Usuario que no es adoptante | 403 |
| Token sin `adoptanteId` (emitido antes de A8) | 403, volver a iniciar sesión |
| `:id` sin formato UUID, `comentario` vacío o campos extra (`estado`…) | 400 |
| Checkpoint inexistente **o de otro adoptante** | 404 (no se revela cuál) |
| Checkpoint ya respondido o vencido | 409 |

## Política de fechas y vencimiento (provisional)

- `fechaProgramada` = día de aprobación + 30 o + 90 días **calendario**.
  El día de aprobación es la fecha local del servidor de `fechaResolucion`
  (una aprobación a las 23:30 cuenta desde ese día). Se guarda como
  `'YYYY-MM-DD'` en la columna `date`, sin desplazamientos por zona horaria.
- Se puede responder **antes** de la fecha programada y **el mismo día**.
- Un checkpoint `pendiente` cuya fecha ya pasó se marca como `vencido` (y se
  guarda) al consultarlo o al intentar responderlo. No hay tarea programada.
- Un checkpoint `respondido` o `vencido` no se puede responder (409).

Si el equipo acuerda otra regla, se cambia en `seguimiento-rules.service.ts`
(`estaVencido` y `ensurePuedeResponder`) y sus pruebas.

## Integración con Solicitudes (para Rosa)

`SeguimientoModule` exporta `SeguimientoService`. Para crear los checkpoints al
aprobar una solicitud:

1. En `SolicitudesModule`: `imports: [..., SeguimientoModule]`.
2. Inyectar `private readonly seguimientoService: SeguimientoService`.
3. Dentro de la **misma transacción** de la aprobación, después de guardar la
   solicitud con `estado = aprobada` y `fechaResolucion`:

```ts
await this.dataSource.transaction(async (manager) => {
  // ... aprobar la solicitud con manager.save(...), fijando fechaResolucion,
  //     cerrar las demás pendientes y marcar el animal como adoptado ...
  await this.seguimientoService.crearCheckpointsDeAprobacion(
    manager,
    solicitud.id,
  );
});
```

Contrato de `crearCheckpointsDeAprobacion(manager, solicitudId)`:

- `manager`: el `EntityManager` de la transacción de aprobación. Así, si falla la
  creación de checkpoints, tampoco queda aprobada la solicitud.
- `solicitudId`: id de la solicitud ya aprobada **dentro de esa transacción**.
- Lee la solicitud con ese `manager`: 404 si no existe; 409 si no está
  `aprobada` o no tiene `fechaResolucion`.
- Es idempotente: si ya existen checkpoints, solo crea los que falten
  (además, la tabla tiene `UNIQUE (solicitud_id, tipo)`).
- Devuelve los dos checkpoints.

Pendiente de confirmar con Rosa: que la aprobación use `dataSource.transaction`,
que `fechaResolucion` sea la fecha base, si se crean notificaciones sobre los
checkpoints y si una aprobación puede deshacerse.
