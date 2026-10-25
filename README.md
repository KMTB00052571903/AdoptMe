# 🐾 AdoptMe — Programación Web 2026-2

AdoptMe es una plataforma web de adopción y seguimiento de perros y gatos para fundaciones de rescate. Hoy muchas fundaciones manejan sus adopciones por Instagram y WhatsApp, sin un registro de qué animal sigue disponible, quién lo pidió ni cómo le va después de adoptado. AdoptMe organiza ese proceso de principio a fin.

## ✨ Qué se puede hacer

**Como fundación:**
* Publicar fichas de animales con fotos, ficha de salud y estado (disponible, en proceso, adoptado).
* Revisar las solicitudes de adopción y aprobarlas o rechazarlas con un motivo.
* Hacer seguimiento a los animales adoptados con checkpoints a los 30 y 90 días.

**Como adoptante:**
* Explorar el catálogo y filtrar por especie, edad y tamaño.
* Enviar una solicitud de adopción y ver en qué estado va.
* Responder los checkpoints de seguimiento después de adoptar.

**Reglas principales:**
* Un animal solo puede tener **una** solicitud aprobada. Al aprobar una, las demás pendientes se cierran automáticamente y se notifica a esos adoptantes.
* Al aprobarse una adopción se crean automáticamente los checkpoints de 30 y 90 días.

## 🧩 Funcionalidades principales

| Funcionalidad | Descripción | Módulo |
| --- | --- | --- |
| F1 — Animales | Fichas de animales, fotos, ficha de salud y estados | `animales` |
| F2 — Solicitudes | Solicitud de adopción, aprobación y rechazo | `solicitudes` |
| F3 — Seguimiento | Checkpoints post-adopción a los 30 y 90 días | `seguimiento` |
| Autenticación | Registro, login con JWT y roles (fundación / adoptante) | `auth` |

## 🧠 Estructura del Proyecto (Scaffolding)

```
AdoptMe/
├── backend/                          # API REST en NestJS
│   ├── src/
│   │   ├── animales/                 # F1: animales, fotos y ficha de salud
│   │   │   ├── entities/
│   │   │   │   ├── animal.entity.ts
│   │   │   │   ├── foto-animal.entity.ts
│   │   │   │   └── ficha-salud.entity.ts
│   │   │   └── animales.module.ts
│   │   │
│   │   ├── solicitudes/              # F2: solicitudes de adopción
│   │   │   ├── entities/
│   │   │   │   └── solicitud-adopcion.entity.ts
│   │   │   └── solicitudes.module.ts
│   │   │
│   │   ├── seguimiento/              # F3: checkpoints post-adopción
│   │   │   ├── entities/
│   │   │   │   └── checkpoint.entity.ts
│   │   │   └── seguimiento.module.ts
│   │   │
│   │   ├── usuarios/                 # Usuario, fundación y adoptante
│   │   │   ├── entities/
│   │   │   │   ├── usuario.entity.ts
│   │   │   │   ├── fundacion.entity.ts
│   │   │   │   └── adoptante.entity.ts
│   │   │   └── usuarios.module.ts
│   │   │
│   │   ├── notificaciones/           # Avisos para los usuarios
│   │   │   ├── entities/
│   │   │   │   └── notificacion.entity.ts
│   │   │   └── notificaciones.module.ts
│   │   │
│   │   ├── common/
│   │   │   └── enums/                # Valores permitidos (especie, estados, roles, etc.)
│   │   │
│   │   ├── database/
│   │   │   ├── data-source.ts        # Configuración de TypeORM para las migraciones
│   │   │   └── migrations/           # Historial de cambios de la base de datos
│   │   │
│   │   ├── app.module.ts             # Módulo raíz: conexión a PostgreSQL y módulos
│   │   └── main.ts                   # Punto de entrada de la API
│   │
│   ├── test/                         # Pruebas e2e
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Aplicación web en Next.js
│   ├── app/
│   │   ├── layout.tsx                # Layout principal
│   │   ├── page.tsx                  # Página de inicio
│   │   └── globals.css               # Estilos globales
│   ├── public/                       # Imágenes e íconos
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml                # Base de datos PostgreSQL en Docker
├── .env.example                      # Plantilla de variables de entorno
├── .gitignore
└── README.md
```

## 🗄️ Modelo de datos

La base de datos tiene 9 entidades, definidas en el ERD del D1:

`Usuario` · `Fundacion` · `Adoptante` · `Animal` · `FotoAnimal` · `FichaSalud` · `SolicitudAdopcion` · `Checkpoint` · `Notificacion`

Las tablas se crean con **migraciones** de TypeORM (`synchronize` está desactivado), así todo el equipo y el servidor tienen la misma estructura.

## ⚙️ Cómo correr el proyecto

**Requisitos:** Node.js 20.12 o superior, Docker Desktop y Git.

1. Clonar el repositorio:
```bash
   git clone https://github.com/KMTB00052571903/AdoptMe.git
   cd AdoptMe
```

2. Crear el archivo `.env` en la raíz copiando `.env.example`, y cambiar `DB_PASSWORD` por una contraseña propia. **El `.env` no se sube al repositorio.**

3. Levantar la base de datos (desde la raíz):
```bash
   docker compose up -d
```

4. Instalar dependencias y crear las tablas:
```bash
   cd backend
   npm install
   npm run migration:run
```

5. Iniciar la API:
```bash
   npm run start:dev
```
   La API queda en `http://localhost:3000`.

6. Iniciar el frontend (en otra terminal):
```bash
   cd frontend
   npm install
   npm run dev
```

**Comandos útiles del backend:**

| Comando | Qué hace |
| --- | --- |
| `npm run build` | Compila el proyecto |
| `npm run start:dev` | Inicia la API y se reinicia con cada cambio |
| `npm run test` | Corre las pruebas |
| `npm run migration:generate -- src/database/migrations/Nombre` | Genera una migración a partir de los cambios en las entidades |
| `npm run migration:run` | Ejecuta las migraciones pendientes |
| `npm run migration:show` | Lista las migraciones (`[X]` = ejecutada) |
| `npm run migration:revert` | Deshace la última migración |

## 🌿 Ramas

| Rama | Para qué |
| --- | --- |
| `main` | Versión estable de cada entrega |
| `develop` | Integración: aquí se unen las funcionalidades antes de pasar a `main` |
| `feature/animals` | F1 — Animales |
| `feature/requests` | F2 — Solicitudes |
| `feature/tracking` | F3 — Seguimiento |
| `feature/auth` | Autenticación y roles |

Cada funcionalidad se trabaja en su rama y se une a `develop` con un pull request revisado por otra integrante.

## ✍️ Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/): `tipo(área): descripción`, en inglés.

Ejemplo: `feat(backend): add animal, photo, and health entities`

| Tipo | Descripción |
| --- | --- |
| `feat` | Nuevas características o funcionalidades |
| `fix` | Corrección de errores |
| `chore` | Tareas de mantenimiento o configuración del proyecto |
| `build` | Dependencias y herramientas de compilación |
| `docs` | Cambios en la documentación |
| `test` | Modificaciones o agregados en pruebas |
| `refactor` | Cambios en la estructura del código sin corregir errores ni agregar funciones |
| `style` | Cambios de formato que no afectan la lógica del código |

El área entre paréntesis indica qué parte se tocó: `backend`, `frontend`, `db`, etc.

## 🚀 Tecnologías Usadas

**Backend**
* NestJS 11
* TypeScript
* TypeORM
* PostgreSQL 15
* Passport + JWT (autenticación)

**Frontend**
* Next.js 16
* React 19
* TypeScript
* Tailwind CSS 4

**Infraestructura**
* Docker y Docker Compose
* Git y GitHub

## 👩‍💻 Equipo

| Integrante | Rol | Funcionalidad que lidera |
| --- | --- | --- |
| Isabella D'Otero | A | F1 — Animales |
| Rosa Carvajal | B | F2 — Solicitudes |
| Kami Takegami | C | Autenticación + F3 — Seguimiento |
