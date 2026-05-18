import { AppDataSource } from '../config/database';
import { Snippet } from '../entities/Snippet';
import { Taggable } from '../entities/Taggable';

export class SnippetService {
    private snippetRepository = AppDataSource.getRepository(Snippet);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async findAll(userId: number, filters?: {
        search?: string;
        categoryId?: number;
        language?: string;
        isFavorite?: boolean;
        tagIds?: number[];
    }) {
        const queryBuilder = this.snippetRepository.createQueryBuilder('snippet')
            .leftJoinAndSelect('snippet.category', 'category')
            .where('snippet.userId = :userId', { userId });

        if (filters?.search) {
            queryBuilder.andWhere(
                '(snippet.title LIKE :search OR snippet.description LIKE :search OR snippet.content LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        if (filters?.categoryId) {
            queryBuilder.andWhere('snippet.categoryId = :categoryId', { categoryId: filters.categoryId });
        }

        if (filters?.language) {
            queryBuilder.andWhere('snippet.language = :language', { language: filters.language });
        }

        if (filters?.isFavorite !== undefined) {
            queryBuilder.andWhere('snippet.isFavorite = :isFavorite', { isFavorite: filters.isFavorite });
        }

        const snippets = await queryBuilder
            .orderBy('snippet.isFavorite', 'DESC')
            .addOrderBy('snippet.updatedAt', 'DESC')
            .getMany();

        return await this.loadTagsForSnippets(snippets);
    }

    async findOne(id: number, userId: number) {
        const snippet = await this.snippetRepository.findOne({
            where: { id, userId },
            relations: ['category']
        });

        if (!snippet) return null;

        const snippetsWithTags = await this.loadTagsForSnippets([snippet]);
        return snippetsWithTags[0] || null;
    }

    async create(userId: number, data: {
        title: string;
        content: string;
        language?: string;
        description?: string;
        isFavorite?: boolean;
        categoryId?: number;
        tagIds?: number[];
    }) {
        const snippet = new Snippet();
        snippet.title = data.title;
        snippet.content = data.content;
        snippet.language = data.language || 'txt';
        snippet.description = data.description || '';
        snippet.isFavorite = data.isFavorite || false;
        snippet.userId = userId;

        if (data.categoryId) {
            snippet.categoryId = data.categoryId;
        }

        const savedSnippet = await this.snippetRepository.save(snippet);

        // Handle tags
        if (data.tagIds && data.tagIds.length > 0) {
            await this.syncTags(savedSnippet.id, data.tagIds);
        }

        return await this.findOne(savedSnippet.id, userId);
    }

    async update(id: number, userId: number, data: {
        title?: string;
        content?: string;
        language?: string;
        description?: string;
        isFavorite?: boolean;
        categoryId?: number;
        tagIds?: number[];
    }) {
        const snippet = await this.snippetRepository.findOne({ where: { id, userId } });

        if (!snippet) {
            throw new Error('Snippet not found');
        }

        if (data.title !== undefined) snippet.title = data.title;
        if (data.content !== undefined) snippet.content = data.content;
        if (data.language !== undefined) snippet.language = data.language;
        if (data.description !== undefined) snippet.description = data.description;
        if (data.isFavorite !== undefined) snippet.isFavorite = data.isFavorite;
        if (data.categoryId !== undefined) {
            snippet.categoryId = data.categoryId;
        }

        await this.snippetRepository.save(snippet);

        // Handle tags
        if (data.tagIds) {
            await this.syncTags(id, data.tagIds);
        }

        return await this.findOne(id, userId);
    }

    async delete(id: number, userId: number) {
        const snippet = await this.snippetRepository.findOne({ where: { id, userId } });

        if (!snippet) {
            throw new Error('Snippet not found');
        }

        // Delete related taggables
        await this.taggableRepository.delete({
            taggableId: id,
            taggableType: 'snippet'
        });

        await this.snippetRepository.remove(snippet);
        return { message: 'Snippet deleted successfully' };
    }

    async toggleFavorite(id: number, userId: number) {
        const snippet = await this.snippetRepository.findOne({ where: { id, userId } });

        if (!snippet) {
            throw new Error('Snippet not found');
        }

        snippet.isFavorite = !snippet.isFavorite;
        await this.snippetRepository.save(snippet);

        return await this.findOne(id, userId);
    }

    private async syncTags(snippetId: number, tagIds: number[]) {
        await this.taggableRepository.delete({
            taggableId: snippetId,
            taggableType: 'snippet'
        });

        if (tagIds.length > 0) {
            const taggablesToSave: Taggable[] = [];

            for (const tagId of tagIds) {
                const taggable = new Taggable();
                taggable.tagId = tagId;
                taggable.taggableId = snippetId;
                taggable.taggableType = 'snippet';
                taggablesToSave.push(taggable);
            }

            await this.taggableRepository.save(taggablesToSave);
        }
    }

    private async loadTagsForSnippets(snippets: Snippet[]): Promise<any[]> {
        const snippetsWithTags = [];

        for (const snippet of snippets) {
            const taggables = await this.taggableRepository.find({
                where: {
                    taggableId: snippet.id,
                    taggableType: 'snippet'
                },
                relations: ['tag']
            });

            snippetsWithTags.push({
                ...snippet,
                tags: taggables.map(t => t.tag)
            });
        }

        return snippetsWithTags;
    }
}