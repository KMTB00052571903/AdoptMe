# ---------- Etapa 1: compilar ----------
# Imagen con Node 24 (la misma versión que usa el equipo).
FROM node:24-slim AS build
WORKDIR /app

# Primero solo los archivos de dependencias: si no cambian, Docker
# reutiliza esta capa y no vuelve a instalar todo en cada build.
COPY package.json package-lock.json ./
RUN npm ci

# Después el código, se compila a JavaScript (dist/) y se quitan
# las dependencias de desarrollo (Jest, ESLint, etc.).
COPY . .
RUN npm run build && npm prune --omit=dev

# ---------- Etapa 2: ejecutar ----------
# Imagen limpia: solo lo necesario para correr la API.
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# No correr como root dentro del contenedor.
USER node

EXPOSE 3000
CMD ["node", "dist/main"]