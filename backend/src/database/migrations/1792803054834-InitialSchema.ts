import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1792803054834 implements MigrationInterface {
    name = 'InitialSchema1792803054834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."checkpoint_tipo_enum" AS ENUM('dia_30', 'dia_90')`);
        await queryRunner.query(`CREATE TYPE "public"."checkpoint_estado_enum" AS ENUM('pendiente', 'respondido', 'vencido')`);
        await queryRunner.query(`CREATE TABLE "checkpoint" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "solicitud_id" uuid NOT NULL, "tipo" "public"."checkpoint_tipo_enum" NOT NULL, "fecha_programada" date NOT NULL, "estado" "public"."checkpoint_estado_enum" NOT NULL DEFAULT 'pendiente', "fecha_respuesta" TIMESTAMP, "comentario" text, "foto_url" character varying, CONSTRAINT "UQ_checkpoint_solicitud_tipo" UNIQUE ("solicitud_id", "tipo"), CONSTRAINT "PK_fea86db187949398f8b614f730a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."solicitud_adopcion_estado_enum" AS ENUM('pendiente', 'aprobada', 'rechazada', 'cerrada_por_otra_adopcion')`);
        await queryRunner.query(`CREATE TABLE "solicitud_adopcion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "animal_id" uuid NOT NULL, "adoptante_id" uuid NOT NULL, "motivacion" text NOT NULL, "condiciones_hogar" text NOT NULL, "estado" "public"."solicitud_adopcion_estado_enum" NOT NULL DEFAULT 'pendiente', "motivo_rechazo" text, "fecha_solicitud" TIMESTAMP NOT NULL DEFAULT now(), "fecha_resolucion" TIMESTAMP, CONSTRAINT "CHK_solicitud_fecha_resolucion" CHECK ("fecha_resolucion" IS NULL OR "fecha_resolucion" >= "fecha_solicitud"), CONSTRAINT "PK_660b0afc6187b6b0419c9481fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_solicitud_aprobada_por_animal" ON "solicitud_adopcion"  ("animal_id") WHERE "estado" = 'aprobada'`);
        await queryRunner.query(`CREATE TABLE "adoptante" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "telefono" character varying NOT NULL, "direccion" character varying NOT NULL, "experiencia_previa" text, CONSTRAINT "REL_b24fc77bba020a98873386426b" UNIQUE ("usuario_id"), CONSTRAINT "PK_ca190927e607ede38b6647669ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notificacion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "tipo" character varying NOT NULL, "mensaje" text NOT NULL, "leida" boolean NOT NULL DEFAULT false, "fecha" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b4402a54386266ca21a86420f77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_rol_enum" AS ENUM('fundacion', 'adoptante')`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "rol" "public"."usuario_rol_enum" NOT NULL, "fecha_registro" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fundacion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "nombre_publico" character varying NOT NULL, "descripcion" text NOT NULL, "ciudad" character varying NOT NULL, "telefono_contacto" character varying NOT NULL, CONSTRAINT "REL_07de61a83469fc945d949799a4" UNIQUE ("usuario_id"), CONSTRAINT "PK_92836d1f79855024741e1b73db2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ficha_salud" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "animal_id" uuid NOT NULL, "vacunas_al_dia" boolean NOT NULL, "esterilizado" boolean NOT NULL, "condiciones_medicas" text, "fecha_ultima_revision" date, CONSTRAINT "REL_d9fb52510ce9803c0fe25159a0" UNIQUE ("animal_id"), CONSTRAINT "PK_81280a03a621abc498af8f81bc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "foto_animal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "animal_id" uuid NOT NULL, "url" character varying NOT NULL, "orden" integer NOT NULL, CONSTRAINT "UQ_foto_animal_animal_orden" UNIQUE ("animal_id", "orden"), CONSTRAINT "CHK_foto_animal_orden" CHECK ("orden" >= 1), CONSTRAINT "PK_568b3a4085fc3dc4ab5ce133177" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."animal_especie_enum" AS ENUM('perro', 'gato')`);
        await queryRunner.query(`CREATE TYPE "public"."animal_sexo_enum" AS ENUM('macho', 'hembra')`);
        await queryRunner.query(`CREATE TYPE "public"."animal_tamano_enum" AS ENUM('pequeno', 'mediano', 'grande')`);
        await queryRunner.query(`CREATE TYPE "public"."animal_estado_enum" AS ENUM('disponible', 'en_proceso', 'adoptado', 'no_disponible')`);
        await queryRunner.query(`CREATE TABLE "animal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fundacion_id" uuid NOT NULL, "nombre" character varying NOT NULL, "especie" "public"."animal_especie_enum" NOT NULL, "sexo" "public"."animal_sexo_enum" NOT NULL, "raza_aproximada" character varying, "edad_aproximada_meses" integer NOT NULL, "tamano" "public"."animal_tamano_enum" NOT NULL, "estado" "public"."animal_estado_enum" NOT NULL DEFAULT 'disponible', "descripcion" text NOT NULL, "fecha_ingreso" date NOT NULL, CONSTRAINT "PK_af42b1374c042fb3fa2251f9f42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD CONSTRAINT "FK_f3cd0c44c7b144aeb459db3f757" FOREIGN KEY ("solicitud_id") REFERENCES "solicitud_adopcion"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "solicitud_adopcion" ADD CONSTRAINT "FK_86eb3668d6152aff7617fbcb3f2" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "solicitud_adopcion" ADD CONSTRAINT "FK_60e8f2a1632bcc6ad276ab406f9" FOREIGN KEY ("adoptante_id") REFERENCES "adoptante"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "adoptante" ADD CONSTRAINT "FK_b24fc77bba020a98873386426b7" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notificacion" ADD CONSTRAINT "FK_6c7a40c0a97e2d62f07156c2943" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fundacion" ADD CONSTRAINT "FK_07de61a83469fc945d949799a4e" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ficha_salud" ADD CONSTRAINT "FK_d9fb52510ce9803c0fe25159a05" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "foto_animal" ADD CONSTRAINT "FK_c14523e33cb1746da9cc0e0dcc1" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "animal" ADD CONSTRAINT "FK_5fd8544f4d8d94d4b34ae19d471" FOREIGN KEY ("fundacion_id") REFERENCES "fundacion"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animal" DROP CONSTRAINT "FK_5fd8544f4d8d94d4b34ae19d471"`);
        await queryRunner.query(`ALTER TABLE "foto_animal" DROP CONSTRAINT "FK_c14523e33cb1746da9cc0e0dcc1"`);
        await queryRunner.query(`ALTER TABLE "ficha_salud" DROP CONSTRAINT "FK_d9fb52510ce9803c0fe25159a05"`);
        await queryRunner.query(`ALTER TABLE "fundacion" DROP CONSTRAINT "FK_07de61a83469fc945d949799a4e"`);
        await queryRunner.query(`ALTER TABLE "notificacion" DROP CONSTRAINT "FK_6c7a40c0a97e2d62f07156c2943"`);
        await queryRunner.query(`ALTER TABLE "adoptante" DROP CONSTRAINT "FK_b24fc77bba020a98873386426b7"`);
        await queryRunner.query(`ALTER TABLE "solicitud_adopcion" DROP CONSTRAINT "FK_60e8f2a1632bcc6ad276ab406f9"`);
        await queryRunner.query(`ALTER TABLE "solicitud_adopcion" DROP CONSTRAINT "FK_86eb3668d6152aff7617fbcb3f2"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP CONSTRAINT "FK_f3cd0c44c7b144aeb459db3f757"`);
        await queryRunner.query(`DROP TABLE "animal"`);
        await queryRunner.query(`DROP TYPE "public"."animal_estado_enum"`);
        await queryRunner.query(`DROP TYPE "public"."animal_tamano_enum"`);
        await queryRunner.query(`DROP TYPE "public"."animal_sexo_enum"`);
        await queryRunner.query(`DROP TYPE "public"."animal_especie_enum"`);
        await queryRunner.query(`DROP TABLE "foto_animal"`);
        await queryRunner.query(`DROP TABLE "ficha_salud"`);
        await queryRunner.query(`DROP TABLE "fundacion"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_rol_enum"`);
        await queryRunner.query(`DROP TABLE "notificacion"`);
        await queryRunner.query(`DROP TABLE "adoptante"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_solicitud_aprobada_por_animal"`);
        await queryRunner.query(`DROP TABLE "solicitud_adopcion"`);
        await queryRunner.query(`DROP TYPE "public"."solicitud_adopcion_estado_enum"`);
        await queryRunner.query(`DROP TABLE "checkpoint"`);
        await queryRunner.query(`DROP TYPE "public"."checkpoint_estado_enum"`);
        await queryRunner.query(`DROP TYPE "public"."checkpoint_tipo_enum"`);
    }

}
