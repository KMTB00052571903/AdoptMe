import { MigrationInterface, QueryRunner } from 'typeorm';

// Activa la extensión unaccent de PostgreSQL para comparar textos sin tildes
// (ej. el filtro de ciudad del catálogo: "bogota" encuentra "Bogotá").
export class EnableUnaccent1792900000000 implements MigrationInterface {
  name = 'EnableUnaccent1792900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS "unaccent"`);
  }
}