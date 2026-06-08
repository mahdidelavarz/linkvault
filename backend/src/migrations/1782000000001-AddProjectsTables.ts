import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectsTables1782000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "projects" (
                "id" serial NOT NULL,
                "title" character varying(255) NOT NULL,
                "description" text,
                "color" character varying(20),
                "emoji" character varying(10),
                "user_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_projects" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "project_items" (
                "id" serial NOT NULL,
                "project_id" integer NOT NULL,
                "item_type" character varying(30) NOT NULL,
                "item_id" integer NOT NULL,
                "sort_order" integer NOT NULL DEFAULT 0,
                "added_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_project_items" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_project_items_unique" UNIQUE ("project_id", "item_type", "item_id"),
                CONSTRAINT "FK_project_items_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_projects_user_updated" ON "projects" ("user_id", "updated_at")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_project_items_project_sort" ON "project_items" ("project_id", "sort_order")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_project_items_type_id" ON "project_items" ("item_type", "item_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "project_items"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    }
}
