import { AppDataSource } from './database';

// Enables pg_trgm and creates GIN trigram indexes for LIKE '%term%' searches.
// Safe to run repeatedly — all statements use IF NOT EXISTS.
export async function initSearchIndexes(): Promise<void> {
    const runner = AppDataSource.createQueryRunner();
    try {
        await runner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

        const indexes: [string, string, string][] = [
            // [table, column, index_name]
            ['links',           'title',       'idx_links_title_trgm'],
            ['links',           'url',         'idx_links_url_trgm'],
            ['links',           'description', 'idx_links_description_trgm'],
            ['notes',           'title',       'idx_notes_title_trgm'],
            ['notes',           'content',     'idx_notes_content_trgm'],
            ['snippets',        'title',       'idx_snippets_title_trgm'],
            ['snippets',        'content',     'idx_snippets_content_trgm'],
            ['snippets',        'description', 'idx_snippets_description_trgm'],
            ['prompts',         'title',       'idx_prompts_title_trgm'],
            ['prompts',         'content',     'idx_prompts_content_trgm'],
            ['prompts',         'description', 'idx_prompts_description_trgm'],
            ['infrastructures', 'title',       'idx_infras_title_trgm'],
            ['infrastructures', 'content',     'idx_infras_content_trgm'],
            ['infrastructures', 'description', 'idx_infras_description_trgm'],
        ];

        for (const [table, col, name] of indexes) {
            await runner.query(
                `CREATE INDEX IF NOT EXISTS ${name} ON ${table} USING GIN (${col} gin_trgm_ops)`
            );
        }
    } catch (err) {
        console.error('Failed to create search indexes:', err);
    } finally {
        await runner.release();
    }
}
