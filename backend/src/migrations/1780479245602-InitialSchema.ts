import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1780479245602 implements MigrationInterface {
    name = 'InitialSchema1780479245602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_notes_title_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_notes_content_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_links_title_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_links_url_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_links_description_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_snippets_title_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_snippets_content_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_snippets_description_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_prompts_title_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_prompts_content_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_prompts_description_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_infras_title_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_infras_content_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."idx_infras_description_trgm"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_infras_description_trgm" ON "infrastructures" ("description") `);
        await queryRunner.query(`CREATE INDEX "idx_infras_content_trgm" ON "infrastructures" ("content") `);
        await queryRunner.query(`CREATE INDEX "idx_infras_title_trgm" ON "infrastructures" ("title") `);
        await queryRunner.query(`CREATE INDEX "idx_prompts_description_trgm" ON "prompts" ("description") `);
        await queryRunner.query(`CREATE INDEX "idx_prompts_content_trgm" ON "prompts" ("content") `);
        await queryRunner.query(`CREATE INDEX "idx_prompts_title_trgm" ON "prompts" ("title") `);
        await queryRunner.query(`CREATE INDEX "idx_snippets_description_trgm" ON "snippets" ("description") `);
        await queryRunner.query(`CREATE INDEX "idx_snippets_content_trgm" ON "snippets" ("content") `);
        await queryRunner.query(`CREATE INDEX "idx_snippets_title_trgm" ON "snippets" ("title") `);
        await queryRunner.query(`CREATE INDEX "idx_links_description_trgm" ON "links" ("description") `);
        await queryRunner.query(`CREATE INDEX "idx_links_url_trgm" ON "links" ("url") `);
        await queryRunner.query(`CREATE INDEX "idx_links_title_trgm" ON "links" ("title") `);
        await queryRunner.query(`CREATE INDEX "idx_notes_content_trgm" ON "notes" ("content") `);
        await queryRunner.query(`CREATE INDEX "idx_notes_title_trgm" ON "notes" ("title") `);
    }

}
