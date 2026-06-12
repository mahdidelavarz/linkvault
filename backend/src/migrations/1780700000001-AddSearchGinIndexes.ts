import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Recreates trigram GIN indexes for full-text LIKE search across all searchable modules.
 *
 * The previous InitialSchema migration dropped these indexes. This migration restores them
 * using the correct GIN index type with gin_trgm_ops, which is required for efficient
 * LIKE '%term%' queries in PostgreSQL.
 *
 * Requires the pg_trgm extension (created here if it does not already exist).
 */
export class AddSearchGinIndexes1780700000001 implements MigrationInterface {
    name = 'AddSearchGinIndexes1780700000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable trigram extension — safe to run even if already present
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

        // Notes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notes_title_trgm"
            ON "notes" USING gin ("title" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notes_content_trgm"
            ON "notes" USING gin ("content" gin_trgm_ops)`);

        // Links
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_links_title_trgm"
            ON "links" USING gin ("title" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_links_url_trgm"
            ON "links" USING gin ("url" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_links_description_trgm"
            ON "links" USING gin ("description" gin_trgm_ops)`);

        // Snippets
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_snippets_title_trgm"
            ON "snippets" USING gin ("title" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_snippets_content_trgm"
            ON "snippets" USING gin ("content" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_snippets_description_trgm"
            ON "snippets" USING gin ("description" gin_trgm_ops)`);

        // Prompts
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_prompts_title_trgm"
            ON "prompts" USING gin ("title" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_prompts_content_trgm"
            ON "prompts" USING gin ("content" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_prompts_description_trgm"
            ON "prompts" USING gin ("description" gin_trgm_ops)`);

        // Infrastructures
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_infras_title_trgm"
            ON "infrastructures" USING gin ("title" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_infras_content_trgm"
            ON "infrastructures" USING gin ("content" gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_infras_description_trgm"
            ON "infrastructures" USING gin ("description" gin_trgm_ops)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_infras_description_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_infras_content_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_infras_title_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_prompts_description_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_prompts_content_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_prompts_title_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_snippets_description_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_snippets_content_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_snippets_title_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_links_description_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_links_url_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_links_title_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_notes_content_trgm"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_notes_title_trgm"`);
    }
}
