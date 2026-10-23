import { DataSource } from 'typeorm';

// DataSource que usa SOLO la CLI de TypeORM (migraciones); la app usa app.module.ts.
// Lee el .env de la raíz del repositorio (los comandos se ejecutan desde backend/).
process.loadEnvFile('../.env');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
