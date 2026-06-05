import { AppDataSource } from '../config/database';
import { Prompt } from '../entities/Prompt';
import { Taggable } from '../entities/Taggable';
import { loadTagsForItems } from '../utils/tagLoader';

export class PromptService {
    private promptRepository = AppDataSource.getRepository(Prompt);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async findAll(
        userId: number,
        filters?: { search?: string; categoryId?: number; promptType?: string; targetAI?: string; isFavorite?: boolean; tagIds?: number[] },
        pagination = { page: 1, limit: 20 }
    ) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const queryBuilder = this.promptRepository.createQueryBuilder('prompt')
            .leftJoinAndSelect('prompt.category', 'category')
            .where('prompt.userId = :userId', { userId });

        if (filters?.search) {
            queryBuilder.andWhere(
                '(prompt.title LIKE :search OR prompt.description LIKE :search OR prompt.content LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }
        if (filters?.categoryId) {
            queryBuilder.andWhere('prompt.categoryId = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters?.promptType) {
            queryBuilder.andWhere('prompt.promptType = :promptType', { promptType: filters.promptType });
        }
        if (filters?.targetAI) {
            queryBuilder.andWhere('prompt.targetAI = :targetAI', { targetAI: filters.targetAI });
        }
        if (filters?.isFavorite !== undefined) {
            queryBuilder.andWhere('prompt.isFavorite = :isFavorite', { isFavorite: filters.isFavorite });
        }
        if (filters?.tagIds && filters.tagIds.length > 0) {
            const promptIds = await this.getItemIdsByTags('prompt', filters.tagIds);
            if (promptIds.length === 0) return { items: [], total: 0, page, limit, hasMore: false };
            queryBuilder.andWhere('prompt.id IN (:...promptIds)', { promptIds });
        }

        const [raw, total] = await queryBuilder
            .orderBy('prompt.isFavorite', 'DESC')
            .addOrderBy('prompt.usageCount', 'DESC')
            .addOrderBy('prompt.updatedAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const items = await this.loadTagsForPrompts(raw);

        // Merge JSONB columns — TypeORM sometimes omits them from entity SELECT
        if (items.length > 0) {
            const ids = items.map((i: any) => i.id);
            const jsonRows = await AppDataSource.query(
                `SELECT "id", "versions", "variables" FROM "prompts" WHERE "id" = ANY($1)`,
                [ids]
            );
            const jsonMap = new Map<number, any>(jsonRows.map((r: any) => [r.id, r]));
            for (const item of items as any[]) {
                const row: any = jsonMap.get(item.id);
                if (row) {
                    item.versions  = row.versions  ?? [];
                    item.variables = row.variables ?? [];
                }
            }
        }

        return { items, total, page, limit, hasMore: skip + raw.length < total };
    }

    async findOne(id: number, userId: number) {
        const prompt = await this.promptRepository.findOne({
            where: { id, userId },
            relations: ['category']
        });

        if (!prompt) return null;

        const promptsWithTags = await this.loadTagsForPrompts([prompt]);
        const result = promptsWithTags[0] || null;

        // Merge JSONB columns — TypeORM sometimes omits them from entity SELECT
        if (result) {
            const rows = await AppDataSource.query(
                `SELECT "versions", "variables" FROM "prompts" WHERE "id" = $1`,
                [id]
            );
            if (rows[0]) {
                result.versions  = rows[0].versions  ?? [];
                result.variables = rows[0].variables ?? [];
            }
        }

        return result;
    }

    async create(userId: number, data: {
        title: string;
        content: string;
        description?: string;
        promptType: string;
        targetAI?: string;
        expectedOutput?: string;
        isFavorite?: boolean;
        categoryId?: number;
        tagIds?: number[];
        variables?: Array<{ name: string; defaultValue: string; description?: string }>;
    }) {
        const prompt = new Prompt();
        prompt.title = data.title;
        prompt.content = data.content;
        prompt.description = data.description || '';
        prompt.promptType = data.promptType;
        prompt.targetAI = data.targetAI;
        prompt.expectedOutput = data.expectedOutput || '';
        prompt.isFavorite = data.isFavorite || false;
        prompt.variables = data.variables || [];
        prompt.versions = [];
        prompt.userId = userId;

        if (data.categoryId) {
            prompt.categoryId = data.categoryId;
        }

        const savedPrompt = await this.promptRepository.save(prompt);

        if (data.tagIds && data.tagIds.length > 0) {
            await this.syncTags(savedPrompt.id, data.tagIds);
        }

        return await this.findOne(savedPrompt.id, userId);
    }

    async update(id: number, userId: number, data: {
        title?: string;
        content?: string;
        description?: string;
        promptType?: string;
        targetAI?: string;
        expectedOutput?: string;
        isFavorite?: boolean;
        categoryId?: number;
        tagIds?: number[];
        variables?: Array<{ name: string; defaultValue: string; description?: string }>;
    }) {
        const prompt = await this.promptRepository.findOne({ where: { id, userId } });

        if (!prompt) {
            throw new Error('Prompt not found');
        }

        // Snapshot current state before every update (keep last 5)
        const snapshot = {
            title: prompt.title,
            content: prompt.content,
            description: prompt.description,
            promptType: prompt.promptType,
            targetAI: prompt.targetAI,
            expectedOutput: prompt.expectedOutput,
            variables: prompt.variables,
            savedAt: new Date().toISOString(),
        };
        const existing = Array.isArray(prompt.versions) ? [...prompt.versions] : [];
        existing.unshift(snapshot);
        prompt.versions = existing.slice(0, 5);

        if (data.title !== undefined) prompt.title = data.title;
        if (data.content !== undefined) prompt.content = data.content;
        if (data.description !== undefined) prompt.description = data.description;
        if (data.promptType !== undefined) prompt.promptType = data.promptType;
        if (data.targetAI !== undefined) prompt.targetAI = data.targetAI;
        if (data.expectedOutput !== undefined) prompt.expectedOutput = data.expectedOutput;
        if (data.isFavorite !== undefined) prompt.isFavorite = data.isFavorite;
        if (data.categoryId !== undefined) prompt.categoryId = data.categoryId;
        if (data.variables !== undefined) prompt.variables = data.variables;

        await this.promptRepository.save(prompt);

        // TypeORM dirty-checking skips JSONB columns and also skips updated_at when nothing else
        // changes — force both so the ETag changes and the browser never returns a stale 304.
        await AppDataSource.query(
            `UPDATE "prompts" SET "versions" = $1::jsonb, "variables" = $2::jsonb, "updated_at" = NOW() WHERE "id" = $3`,
            [JSON.stringify(prompt.versions ?? []), JSON.stringify(prompt.variables ?? []), id]
        );

        if (data.tagIds) {
            await this.syncTags(id, data.tagIds);
        }

        return await this.findOne(id, userId);
    }

    async delete(id: number, userId: number) {
        const prompt = await this.promptRepository.findOne({ where: { id, userId } });

        if (!prompt) {
            throw new Error('Prompt not found');
        }

        await this.taggableRepository.delete({
            taggableId: id,
            taggableType: 'prompt'
        });

        await this.promptRepository.remove(prompt);
        return { message: 'Prompt deleted successfully' };
    }

    async toggleFavorite(id: number, userId: number) {
        const prompt = await this.promptRepository.findOne({ where: { id, userId } });

        if (!prompt) {
            throw new Error('Prompt not found');
        }

        prompt.isFavorite = !prompt.isFavorite;
        await this.promptRepository.save(prompt);

        return await this.findOne(id, userId);
    }

    async incrementUsage(id: number, userId: number) {
        const prompt = await this.promptRepository.findOne({ where: { id, userId } });

        if (!prompt) {
            throw new Error('Prompt not found');
        }

        prompt.usageCount += 1;
        prompt.lastUsedAt = new Date();
        await this.promptRepository.save(prompt);

        return await this.findOne(id, userId);
    }

    async getRawVersions(id: number, userId: number) {
        const rows = await AppDataSource.query(
            `SELECT "id", "title", "versions", "variables" FROM "prompts" WHERE "id" = $1 AND "userId" = $2`,
            [id, userId]
        );
        if (!rows[0]) return null;
        return { id: rows[0].id, title: rows[0].title, versions: rows[0].versions ?? [], variables: rows[0].variables ?? [] };
    }

    private async getItemIdsByTags(type: string, tagIds: number[]): Promise<number[]> {
        const taggables = await this.taggableRepository.find({ where: { taggableType: type } });
        return taggables
            .filter(t => tagIds.map(Number).includes(Number(t.tagId)))
            .map(t => t.taggableId);
    }

    private async syncTags(promptId: number, tagIds: number[]) {
        await this.taggableRepository.delete({
            taggableId: promptId,
            taggableType: 'prompt'
        });

        if (tagIds.length > 0) {
            const taggablesToSave: Taggable[] = [];

            for (const tagId of tagIds) {
                const taggable = new Taggable();
                taggable.tagId = tagId;
                taggable.taggableId = promptId;
                taggable.taggableType = 'prompt';
                taggablesToSave.push(taggable);
            }

            await this.taggableRepository.save(taggablesToSave);
        }
    }

    private async loadTagsForPrompts(prompts: Prompt[]): Promise<any[]> {
        return loadTagsForItems(prompts, 'prompt');
    }
}