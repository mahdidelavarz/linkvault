import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromptVariablesAndVersions1780800000001 implements MigrationInterface {
    name = 'AddPromptVariablesAndVersions1780800000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prompts" ADD COLUMN IF NOT EXISTS "variables" jsonb DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "prompts" ADD COLUMN IF NOT EXISTS "versions" jsonb DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prompts" DROP COLUMN IF EXISTS "versions"`);
        await queryRunner.query(`ALTER TABLE "prompts" DROP COLUMN IF EXISTS "variables"`);
    }
}
