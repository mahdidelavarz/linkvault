import { AppDataSource } from '../config/database';
import { Link } from '../entities/Link';
import { Note } from '../entities/Note';
import { Snippet } from '../entities/Snippet';
import { Taggable } from '../entities/Taggable';

export class SearchService {
    private linkRepository = AppDataSource.getRepository(Link);
    private noteRepository = AppDataSource.getRepository(Note);
    private snippetRepository = AppDataSource.getRepository(Snippet);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async globalSearch(userId: number, options: {
        query?: string;
        categoryId?: number;
        tagIds?: number[];
        type?: 'link' | 'note' | 'snippet';
    }) {
        const results: any = {
            links: [],
            notes: [],
            snippets: []
        };

        const searchPromises: Promise<any>[] = [];

        // Search Links
        if (!options.type || options.type === 'link') {
            searchPromises.push(
                this.searchLinks(userId, options).then(links => {
                    results.links = links;
                })
            );
        }

        // Search Notes
        if (!options.type || options.type === 'note') {
            searchPromises.push(
                this.searchNotes(userId, options).then(notes => {
                    results.notes = notes;
                })
            );
        }

        // Search Snippets
        if (!options.type || options.type === 'snippet') {
            searchPromises.push(
                this.searchSnippets(userId, options).then(snippets => {
                    results.snippets = snippets;
                })
            );
        }

        await Promise.all(searchPromises);

        return results;
    }

    private async searchLinks(userId: number, options: {
        query?: string;
        categoryId?: number;
        tagIds?: number[];
    }) {
        const queryBuilder = this.linkRepository.createQueryBuilder('link')
            .leftJoinAndSelect('link.category', 'category')
            .where('link.userId = :userId', { userId });

        if (options.query) {
            queryBuilder.andWhere(
                '(link.title LIKE :query OR link.description LIKE :query OR link.url LIKE :query OR link.username LIKE :query)',
                { query: `%${options.query}%` }
            );
        }

        if (options.categoryId) {
            queryBuilder.andWhere('link.categoryId = :categoryId', { categoryId: options.categoryId });
        }

        if (options.tagIds && options.tagIds.length > 0) {
            const linkIds = await this.getItemIdsByTags('link', options.tagIds);
            if (linkIds.length > 0) {
                queryBuilder.andWhere('link.id IN (:...linkIds)', { linkIds });
            } else {
                return [];
            }
        }

        const links = await queryBuilder
            .orderBy('link.updatedAt', 'DESC')
            .take(20)
            .getMany();

        // Load tags
        return await this.loadTagsForItems(links, 'link');
    }

    private async searchNotes(userId: number, options: {
        query?: string;
        categoryId?: number;
        tagIds?: number[];
    }) {
        const queryBuilder = this.noteRepository.createQueryBuilder('note')
            .leftJoinAndSelect('note.category', 'category')
            .where('note.userId = :userId', { userId });

        if (options.query) {
            queryBuilder.andWhere(
                '(note.title LIKE :query OR note.content LIKE :query)',
                { query: `%${options.query}%` }
            );
        }

        if (options.categoryId) {
            queryBuilder.andWhere('note.categoryId = :categoryId', { categoryId: options.categoryId });
        }

        if (options.tagIds && options.tagIds.length > 0) {
            const noteIds = await this.getItemIdsByTags('note', options.tagIds);
            if (noteIds.length > 0) {
                queryBuilder.andWhere('note.id IN (:...noteIds)', { noteIds });
            } else {
                return [];
            }
        }

        const notes = await queryBuilder
            .orderBy('note.updatedAt', 'DESC')
            .take(20)
            .getMany();

        return await this.loadTagsForItems(notes, 'note');
    }

    private async searchSnippets(userId: number, options: {
        query?: string;
        categoryId?: number;
        tagIds?: number[];
    }) {
        const queryBuilder = this.snippetRepository.createQueryBuilder('snippet')
            .leftJoinAndSelect('snippet.category', 'category')
            .where('snippet.userId = :userId', { userId });

        if (options.query) {
            queryBuilder.andWhere(
                '(snippet.title LIKE :query OR snippet.description LIKE :query OR snippet.content LIKE :query)',
                { query: `%${options.query}%` }
            );
        }

        if (options.categoryId) {
            queryBuilder.andWhere('snippet.categoryId = :categoryId', { categoryId: options.categoryId });
        }

        if (options.tagIds && options.tagIds.length > 0) {
            const snippetIds = await this.getItemIdsByTags('snippet', options.tagIds);
            if (snippetIds.length > 0) {
                queryBuilder.andWhere('snippet.id IN (:...snippetIds)', { snippetIds });
            } else {
                return [];
            }
        }

        const snippets = await queryBuilder
            .orderBy('snippet.updatedAt', 'DESC')
            .take(20)
            .getMany();

        return await this.loadTagsForItems(snippets, 'snippet');
    }

    private async getItemIdsByTags(type: string, tagIds: number[]): Promise<number[]> {
        const taggables = await this.taggableRepository.find({
            where: {
                taggableType: type,
            },
        });

        // Filter taggables that have matching tagIds
        const matchingTaggables = taggables.filter(t => tagIds.includes(t.tagId));
        return matchingTaggables.map(t => t.taggableId);
    }

    private async loadTagsForItems(items: any[], type: string): Promise<any[]> {
        const itemsWithTags = [];

        for (const item of items) {
            const taggables = await this.taggableRepository.find({
                where: {
                    taggableId: item.id,
                    taggableType: type
                },
                relations: ['tag']
            });

            itemsWithTags.push({
                ...item,
                tags: taggables.map(t => t.tag),
                type
            });
        }

        return itemsWithTags;
    }
}