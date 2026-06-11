import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApiEndpointExampleResponse1784000000001 implements MigrationInterface {
    name = 'AddApiEndpointExampleResponse1784000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_endpoints" ADD COLUMN IF NOT EXISTS "example_response" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_endpoints" DROP COLUMN IF EXISTS "example_response"`);
    }
}
