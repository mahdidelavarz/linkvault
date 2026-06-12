import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromptCollectionsTables1783000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "prompt_collections" (
                "id" serial NOT NULL,
                "title" character varying(255) NOT NULL,
                "description" text,
                "color" character varying(20),
                "user_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_prompt_collections" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "prompt_collection_items" (
                "id" serial NOT NULL,
                "collection_id" integer NOT NULL,
                "prompt_id" integer NOT NULL,
                "sort_order" integer NOT NULL DEFAULT 0,
                "added_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_prompt_collection_items" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_prompt_collection_items_unique" UNIQUE ("collection_id", "prompt_id"),
                CONSTRAINT "FK_prompt_collection_items_collection" FOREIGN KEY ("collection_id") REFERENCES "prompt_collections"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prompt_collections_user_updated" ON "prompt_collections" ("user_id", "updated_at")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prompt_collection_items_collection_sort" ON "prompt_collection_items" ("collection_id", "sort_order")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "prompt_collection_items"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "prompt_collections"`);
    }
}
