import { AppDataSource } from '../config/database';
import { Link } from '../entities/Link';
import { Note } from '../entities/Note';
import { Snippet } from '../entities/Snippet';
import { Prompt } from '../entities/Prompt';
import { Infrastructure } from '../entities/Infrastructure';
import { Taggable } from '../entities/Taggable';

export class SearchService {
    private linkRepository           = AppDataSource.getRepository(Link);
    private noteRepository           = AppDataSource.getRepository(Note);
    private snippetRepository        = AppDataSource.getRepository(Snippet);
    private promptRepository         = AppDataSource.getRepository(Prompt);
    private infrastructureRepository = AppDataSource.getRepository(Infrastructure);
    private taggableRepository       = AppDataSource.getRepository(Taggable);

    async globalSearch(userId: number, options: {
        query?: string;
        categoryId?: number;
        tagIds?: number[];
        type?: string;
    }) {
        // P1-7: Return empty results when no query — avoids LIKE '%_%' full-table scans
        // and prevents "everything matches" behaviour on page load.
        if (!options.query?.trim()) {
            return { links: [], notes: [], snippets: [], prompts: [], infrastructures: [] };
        }

        const results: any = {
            links: [],
            notes: [],
            snippets: [],
            prompts: [],
            infrastructures: [],
        };

        const promises: Promise<any>[] = [];

        if (!options.type || options.type === 'link') {
            promises.push(this.searchLinks(userId, options).then(r => { results.links = r; }));
        }
        if (!options.type || options.type === 'note') {
            promises.push(this.searchNotes(userId, options).then(r => { results.notes = r; }));
        }
        if (!options.type || options.type === 'snippet') {
            promises.push(this.searchSnippets(userId, options).then(r => { results.snippets = r; }));
        }
        // P1-4: Prompts now included in search
        if (!options.type || options.type === 'prompt') {
            promises.push(this.searchPrompts(userId, options).then(r => { results.prompts = r; }));
        }
        // P1-5: Infrastructure now included in search
        if (!options.type || options.type === 'infrastructure') {
            promises.push(this.searchInfrastructures(userId, options).then(r => { results.infrastructures = r; }));
        }

        await Promise.all(promises);
        return results;
    }

    // ─── Private search methods ───────────────────────────────────────────────

    private async searchLinks(userId: number, options: { query?: string; categoryId?: number; tagIds?: number[] }) {
        const qb = this.linkRepository.createQueryBuilder('link')
            .leftJoinAndSelect('link.category', 'category')
            .where('link.userId = :userId', { userId });

        if (options.query) {
            qb.andWhere(
                '(link.title LIKE :q OR link.description LIKE :q OR link.url LIKE :q OR link.username LIKE :q)',
                { q: `%${options.query}%` }
            );
        }
        if (options.categoryId) qb.andWhere('link.categoryId = :categoryId', { categoryId: options.categoryId });
        if (options.tagIds?.length) {
            const ids = await this.getItemIdsByTags('link', options.tagIds);
            if (!ids.length) return [];
            qb.andWhere('link.id IN (:...ids)', { ids });
        }

        const items = await qb.orderBy('link.updatedAt', 'DESC').take(20).getMany();
        return this.loadTagsForItems(items, 'link');
    }

    private async searchNotes(userId: number, options: { query?: string; categoryId?: number; tagIds?: number[] }) {
        const qb = this.noteRepository.createQueryBuilder('note')
            .leftJoinAndSelect('note.category', 'category')
            .where('note.userId = :userId', { userId });

        if (options.query) {
            qb.andWhere(
                '(note.title LIKE :q OR note.content LIKE :q)',
                { q: `%${options.query}%` }
            );
        }
        if (options.categoryId) qb.andWhere('note.categoryId = :categoryId', { categoryId: options.categoryId });
        if (options.tagIds?.length) {
            const ids = await this.getItemIdsByTags('note', options.tagIds);
            if (!ids.length) return [];
            qb.andWhere('note.id IN (:...ids)', { ids });
        }

        const items = await qb.orderBy('note.updatedAt', 'DESC').take(20).getMany();
        return this.loadTagsForItems(items, 'note');
    }

    private async searchSnippets(userId: number, options: { query?: string; categoryId?: number; tagIds?: number[] }) {
        const qb = this.snippetRepository.createQueryBuilder('snippet')
            .leftJoinAndSelect('snippet.category', 'category')
            .where('snippet.userId = :userId', { userId });

        if (options.query) {
            qb.andWhere(
                '(snippet.title LIKE :q OR snippet.description LIKE :q OR snippet.content LIKE :q)',
                { q: `%${options.query}%` }
            );
        }
        if (options.categoryId) qb.andWhere('snippet.categoryId = :categoryId', { categoryId: options.categoryId });
        if (options.tagIds?.length) {
            const ids = await this.getItemIdsByTags('snippet', options.tagIds);
            if (!ids.length) return [];
            qb.andWhere('snippet.id IN (:...ids)', { ids });
        }

        const items = await qb.orderBy('snippet.updatedAt', 'DESC').take(20).getMany();
        return this.loadTagsForItems(items, 'snippet');
    }

    private async searchPrompts(userId: number, options: { query?: string; categoryId?: number; tagIds?: number[] }) {
        const qb = this.promptRepository.createQueryBuilder('prompt')
            .leftJoinAndSelect('prompt.category', 'category')
            .where('prompt.userId = :userId', { userId });

        if (options.query) {
            qb.andWhere(
                '(prompt.title LIKE :q OR prompt.description LIKE :q OR prompt.content LIKE :q)',
                { q: `%${options.query}%` }
            );
        }
        if (options.categoryId) qb.andWhere('prompt.categoryId = :categoryId', { categoryId: options.categoryId });
        if (options.tagIds?.length) {
            const ids = await this.getItemIdsByTags('prompt', options.tagIds);
            if (!ids.length) return [];
            qb.andWhere('prompt.id IN (:...ids)', { ids });
        }

        const items = await qb.orderBy('prompt.updatedAt', 'DESC').take(20).getMany();
        return this.loadTagsForItems(items, 'prompt');
    }

    private async searchInfrastructures(userId: number, options: { query?: string; categoryId?: number; tagIds?: number[] }) {
        const qb = this.infrastructureRepository.createQueryBuilder('infra')
            .leftJoinAndSelect('infra.category', 'category')
            .where('infra.userId = :userId', { userId });

        if (options.query) {
            qb.andWhere(
                '(infra.title LIKE :q OR infra.description LIKE :q OR infra.content LIKE :q)',
                { q: `%${options.query}%` }
            );
        }
        if (options.categoryId) qb.andWhere('infra.categoryId = :categoryId', { categoryId: options.categoryId });
        if (options.tagIds?.length) {
            const ids = await this.getItemIdsByTags('infrastructure', options.tagIds);
            if (!ids.length) return [];
            qb.andWhere('infra.id IN (:...ids)', { ids });
        }

        const items = await qb.orderBy('infra.updatedAt', 'DESC').take(20).getMany();
        return this.loadTagsForItems(items, 'infrastructure');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private async getItemIdsByTags(type: string, tagIds: number[]): Promise<number[]> {
        const taggables = await this.taggableRepository.find({ where: { taggableType: type } });
        return taggables.filter(t => tagIds.includes(t.tagId)).map(t => t.taggableId);
    }

    private async loadTagsForItems(items: any[], type: string): Promise<any[]> {
        const result = [];
        for (const item of items) {
            const taggables = await this.taggableRepository.find({
                where: { taggableId: item.id, taggableType: type },
                relations: ['tag'],
            });
            result.push({ ...item, tags: taggables.map(t => t.tag), type });
        }
        return result;
    }
}
