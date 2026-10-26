# Auth: cómo proteger rutas y saber quién llama

## Rutas de Auth

| Método | Ruta | Acceso | Respuesta |
|---|---|---|---|
| POST | `/auth/registro/adoptante` | Pública | 201 `{ id, nombre, email, rol }` |
| POST | `/auth/registro/fundacion` | Pública | 201 `{ id, nombre, email, rol }` |
| POST | `/auth/login` | Pública | 200 `{ accessToken }` |
| GET | `/auth/perfil` | Token | 200 `{ id, email, rol, fundacionId? , adoptanteId? }` |

El token se envía en cada petición protegida con la cabecera
`Authorization: Bearer <accessToken>`. Caduca a la hora.

## Qué hay en `req.user`

Después de `JwtAuthGuard`, `req.user` es un `UsuarioAutenticado`:

| Campo | Contenido |
|---|---|
| `id` | id del **usuario** (tabla `usuario`) |
| `email` | email normalizado |
| `rol` | `RolUsuario.FUNDACION` o `RolUsuario.ADOPTANTE` |
| `fundacionId` | id de la **fundación** (tabla `fundacion`), solo si `rol = fundacion` |
| `adoptanteId` | id del **adoptante** (tabla `adoptante`), solo si `rol = adoptante` |

`fundacionId` y `adoptanteId` salen de la base de datos al hacer login y van
firmados dentro del token: el cliente no puede cambiarlos. **Nunca** los tomes
del body, la URL o la query.

## Ejemplo: ruta solo para fundaciones

```ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestConUsuario } from '../auth/request-con-usuario.interface';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { requestValidationPipe } from '../common/request-validation.pipe';

@Controller('animales')
export class AnimalesController {
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // primero quién eres (401), luego tu rol (403)
  @Roles(RolUsuario.FUNDACION)
  crear(
    @Req() req: RequestConUsuario,
    @Body(requestValidationPipe) dto: CrearAnimalDto,
  ) {
    // RolesGuard ya garantizó que es una fundación, así que fundacionId existe.
    return this.animalesService.crear(req.user.fundacionId!, dto);
  }
}
```

- `@UseGuards(...)` y `@Roles(...)` también se pueden poner sobre la clase para
  proteger todo el controlador.
- No hace falta importar `AuthModule` en tu módulo: basta con importar las clases.
- `RequestConUsuario` se importa con `import type` (lo exige el `tsconfig` en
  métodos con decoradores).

## Respuestas de error

| Caso | Código |
|---|---|
| Sin token, firma inválida o token caducado | 401 |
| Token válido pero rol no permitido por `@Roles` | 403 `No tienes permiso para esta acción` |

## Requisitos para arrancar el backend

- `JWT_SECRET` en tu `.env`. Sin ella la app **no arranca**. Genera la tuya:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Los tokens emitidos antes de que existieran `fundacionId`/`adoptanteId` no los
  traen: haz login de nuevo.
- Para ejecutar pruebas que usen paquetes ESM (`@nestjs/typeorm`, `@nestjs/jwt`,
  `@nestjs/passport`), `npm test` ya arranca Jest con `--experimental-vm-modules`.
