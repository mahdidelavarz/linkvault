import { AppDataSource } from '../config/database';
import { Link } from '../entities/Link';
import { Note } from '../entities/Note';
import { Snippet } from '../entities/Snippet';
import { Prompt } from '../entities/Prompt';
import { Infrastructure } from '../entities/Infrastructure';
import { Taggable } from '../entities/Taggable';

interface GroupResult {
    items: any[];
    total: number;
}

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
        if (!options.query?.trim()) {
            return {
                links: [], notes: [], snippets: [], prompts: [], infrastructures: [],
                totals: { links: 0, notes: 0, snippets: 0, prompts: 0, infrastructures: 0 },
            };
        }

        const groups: Record<string, GroupResult> = {
            links:           { items: [], total: 0 },
            notes:           { items: [], total: 0 },
            snippets:        { items: [], total: 0 },
            prompts:         { items: [], total: 0 },
            infrastructures: { items: [], total: 0 },
        };

        const promises: Promise<any>[] = [];
        if (!options.type || options.type === 'link')           promises.push(this.searchLinks(userId, options).then(r => { groups.links = r; }));
        if (!options.type || options.type === 'note')           promises.push(this.searchNotes(userId, options).then(r => { groups.notes = r; }));
        if (!options.type || options.type === 'snippet')        promises.push(this.searchSnippets(userId, options).then(r => { groups.snippets = r; }));
        if (!options.type || options.type === 'prompt')         promises.push(this.searchPrompts(userId, options).then(r => { groups.prompts = r; }));
        if (!options.type || options.type === 'infrastructure') promises.push(this.searchInfrastructures(userId, options).then(r => { groups.infrastructures = r; }));

        await Promise.all(promises);

        return {
            links:           groups.links.items,
            notes:           groups.notes.items,
            snippets:        groups.snippets.items,
            prompts:         groups.prompts.items,
            infrastructures: groups.infrastructures.items,
            totals: {
                links:           groups.links.total,
                notes:           groups.notes.total,
                snippets:        groups.snippets.total,
                prompts:         groups.prompts.total,
                infrastructures: groups.infrastructures.total,
            },
        };
    }

    // P3-11: Relevance scoring — applied after tag loading so tag matches are available
    private scoreResult(item: any, query: string, tagIds?: number[]): number {
        const q     = query.toLowerCase().trim();
        const title = (item.title || '').toLowerCase();
        let score   = 0;

        if (title === q)          score += 10;
        else if (title.includes(q)) score += 6;

        if (tagIds?.length && item.tags?.some((t: any) => tagIds.includes(t.id))) score += 3;

        const updatedAt = new Date(item.updatedAt);
        if (!isNaN(updatedAt.getTime()) && (Date.now() - updatedAt.getTime()) / 86400000 <= 7) score += 2;

        if (item.isFavorite) score += 1;

        return score;
    }

    private sortByScore(items: any[], query: string, tagIds?: number[]): any[] {
        return items
            .map(item => ({ ...item, _score: this.scoreResult(item, query, tagIds) }))
            .sort((a, b) => b._score - a._score);
    }

    // ─── Per-type search methods ──────────────────────────────────────────────

    private async searchLinks(userId: number, opts: { query?: string; categoryId?: number; tagIds?: number[] }): Promise<GroupResult> {
        const qb = this.linkRepository.createQueryBuilder('link')
            .leftJoinAndSelect('link.category', 'category')
            .where('link.userId = :userId', { userId });

        if (opts.query) qb.andWhere('(link.title LIKE :q OR link.description LIKE :q OR link.url LIKE :q OR link.username LIKE :q)', { q: `%${opts.query}%` });
        if (opts.categoryId) qb.andWhere('link.categoryId = :categoryId', { categoryId: opts.categoryId });
        if (opts.tagIds?.length) {
            const ids = await this.getItemIdsByTags('link', opts.tagIds);
            if (!ids.length) return { items: [], total: 0 };
            qb.andWhere('link.id IN (:...ids)', { ids });
        }

        const [raw, total] = await qb.take(100).getManyAndCount();
        const tagged = await this.loadTagsForItems(raw, 'link');
        return { items: this.sortByScore(tagged, opts.query || '', opts.tagIds), total };
    }

    private async searchNotes(userId: number, opts: { query?: string; categoryId?: number; tagIds?: number[] }): Promise<GroupResult> {
        const qb = this.noteRepository.createQueryBuilder('note')
            .leftJoinAndSelect('note.category', 'category')
            .where('note.userId = :userId', { userId });

        if (opts.query) qb.andWhere('(note.title LIKE :q OR note.content LIKE :q)', { q: `%${opts.query}%` });
        if (opts.categoryId) qb.andWhere('note.categoryId = :categoryId', { categoryId: opts.categoryId });
        if (opts.tagIds?.length) {
            const ids = await this.getItemIdsByTags('note', opts.tagIds);
            if (!ids.length) return { items: [], total: 0 };
            qb.andWhere('note.id IN (:...ids)', { ids });
        }

        const [raw, total] = await qb.take(100).getManyAndCount();
        const tagged = await this.loadTagsForItems(raw, 'note');
        return { items: this.sortByScore(tagged, opts.query || '', opts.tagIds), total };
    }

    private async searchSnippets(userId: number, opts: { query?: string; categoryId?: number; tagIds?: number[] }): Promise<GroupResult> {
        const qb = this.snippetRepository.createQueryBuilder('snippet')
            .leftJoinAndSelect('snippet.category', 'category')
            .where('snippet.userId = :userId', { userId });

        if (opts.query) qb.andWhere('(snippet.title LIKE :q OR snippet.description LIKE :q OR snippet.content LIKE :q)', { q: `%${opts.query}%` });
        if (opts.categoryId) qb.andWhere('snippet.categoryId = :categoryId', { categoryId: opts.categoryId });
        if (opts.tagIds?.length) {
            const ids = await this.getItemIdsByTags('snippet', opts.tagIds);
            if (!ids.length) return { items: [], total: 0 };
            qb.andWhere('snippet.id IN (:...ids)', { ids });
        }

        const [raw, total] = await qb.take(100).getManyAndCount();
        const tagged = await this.loadTagsForItems(raw, 'snippet');
        return { items: this.sortByScore(tagged, opts.query || '', opts.tagIds), total };
    }

    private async searchPrompts(userId: number, opts: { query?: string; categoryId?: number; tagIds?: number[] }): Promise<GroupResult> {
        const qb = this.promptRepository.createQueryBuilder('prompt')
            .leftJoinAndSelect('prompt.category', 'category')
            .where('prompt.userId = :userId', { userId });

        if (opts.query) qb.andWhere('(prompt.title LIKE :q OR prompt.description LIKE :q OR prompt.content LIKE :q)', { q: `%${opts.query}%` });
        if (opts.categoryId) qb.andWhere('prompt.categoryId = :categoryId', { categoryId: opts.categoryId });
        if (opts.tagIds?.length) {
            const ids = await this.getItemIdsByTags('prompt', opts.tagIds);
            if (!ids.length) return { items: [], total: 0 };
            qb.andWhere('prompt.id IN (:...ids)', { ids });
        }

        const [raw, total] = await qb.take(100).getManyAndCount();
        const tagged = await this.loadTagsForItems(raw, 'prompt');
        return { items: this.sortByScore(tagged, opts.query || '', opts.tagIds), total };
    }

    private async searchInfrastructures(userId: number, opts: { query?: string; categoryId?: number; tagIds?: number[] }): Promise<GroupResult> {
        const qb = this.infrastructureRepository.createQueryBuilder('infra')
            .leftJoinAndSelect('infra.category', 'category')
            .where('infra.userId = :userId', { userId });

        if (opts.query) qb.andWhere('(infra.title LIKE :q OR infra.description LIKE :q OR infra.content LIKE :q)', { q: `%${opts.query}%` });
        if (opts.categoryId) qb.andWhere('infra.categoryId = :categoryId', { categoryId: opts.categoryId });
        if (opts.tagIds?.length) {
            const ids = await this.getItemIdsByTags('infrastructure', opts.tagIds);
            if (!ids.length) return { items: [], total: 0 };
            qb.andWhere('infra.id IN (:...ids)', { ids });
        }

        const [raw, total] = await qb.take(100).getManyAndCount();
        const tagged = await this.loadTagsForItems(raw, 'infrastructure');
        return { items: this.sortByScore(tagged, opts.query || '', opts.tagIds), total };
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
