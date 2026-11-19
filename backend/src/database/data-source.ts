import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';

// DataSource que usa SOLO la CLI de TypeORM (migraciones y seed); la app usa app.module.ts.
// Por defecto lee el .env de la raíz (los comandos se ejecutan desde backend/).
// Con ENV_FILE se puede usar otro archivo, por ejemplo para migrar la base de Neon.
const envFile = process.env.ENV_FILE ?? '../.env';
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});