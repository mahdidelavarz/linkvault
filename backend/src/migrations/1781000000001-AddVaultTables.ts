import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVaultTables1781000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_vaults" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "user_id" integer NOT NULL,
                "encrypted_vault_key" text,
                "is_enabled" boolean NOT NULL DEFAULT false,
                "enabled_at" TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_vaults" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_user_vaults_user_id" UNIQUE ("user_id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "secure_fields" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "user_id" integer NOT NULL,
                "module" character varying NOT NULL,
                "record_id" character varying NOT NULL,
                "field_name" character varying NOT NULL,
                "encrypted_value" text NOT NULL,
                "iv" text NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_secure_fields" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_secure_fields_lookup" UNIQUE ("user_id", "module", "record_id", "field_name")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "secure_fields"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_vaults"`);
    }
}
