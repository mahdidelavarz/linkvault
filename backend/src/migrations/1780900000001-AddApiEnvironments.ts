import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApiEnvironments1780900000001 implements MigrationInterface {
    name = 'AddApiEnvironments1780900000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "api_environments" (
                "id"         SERIAL PRIMARY KEY,
                "name"       varchar(100) NOT NULL,
                "variables"  text,
                "user_id"    int NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_api_environments_user_id" ON "api_environments" ("user_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_api_environments_user_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "api_environments"`);
    }
}
