import { AppDataSource } from '../config/database';
import { Prompt } from '../entities/Prompt';
import { Taggable } from '../entities/Taggable';

export class PromptService {
    private promptRepository = AppDataSource.getRepository(Prompt);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async findAll(userId: number, filters?: {
        search?: string;
        categoryId?: number;
        promptType?: string;
        targetAI?: string;
        isFavorite?: boolean;
        tagIds?: number[];
    }) {
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

        const prompts = await queryBuilder
            .orderBy('prompt.isFavorite', 'DESC')
            .addOrderBy('prompt.usageCount', 'DESC')
            .addOrderBy('prompt.updatedAt', 'DESC')
            .getMany();

        return await this.loadTagsForPrompts(prompts);
    }

    async findOne(id: number, userId: number) {
        const prompt = await this.promptRepository.findOne({
            where: { id, userId },
            relations: ['category']
        });

        if (!prompt) return null;

        const promptsWithTags = await this.loadTagsForPrompts([prompt]);
        return promptsWithTags[0] || null;
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
    }) {
        const prompt = new Prompt();
        prompt.title = data.title;
        prompt.content = data.content;
        prompt.description = data.description || '';
        prompt.promptType = data.promptType;
        prompt.targetAI = data.targetAI;
        prompt.expectedOutput = data.expectedOutput || '';
        prompt.isFavorite = data.isFavorite || false;
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
    }) {
        const prompt = await this.promptRepository.findOne({ where: { id, userId } });

        if (!prompt) {
            throw new Error('Prompt not found');
        }

        if (data.title !== undefined) prompt.title = data.title;
        if (data.content !== undefined) prompt.content = data.content;
        if (data.description !== undefined) prompt.description = data.description;
        if (data.promptType !== undefined) prompt.promptType = data.promptType;
        if (data.targetAI !== undefined) prompt.targetAI = data.targetAI;
        if (data.expectedOutput !== undefined) prompt.expectedOutput = data.expectedOutput;
        if (data.isFavorite !== undefined) prompt.isFavorite = data.isFavorite;
        if (data.categoryId !== undefined) prompt.categoryId = data.categoryId;

        await this.promptRepository.save(prompt);

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
        const promptsWithTags = [];

        for (const prompt of prompts) {
            const taggables = await this.taggableRepository.find({
                where: {
                    taggableId: prompt.id,
                    taggableType: 'prompt'
                },
                relations: ['tag']
            });

            promptsWithTags.push({
                ...prompt,
                tags: taggables.map(t => t.tag)
            });
        }

        return promptsWithTags;
    }
}