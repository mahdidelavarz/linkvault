import { AppDataSource } from '../config/database';
import { Infrastructure } from '../entities/Infrastructure';
import { Taggable } from '../entities/Taggable';

export class InfraService {
    private infraRepository = AppDataSource.getRepository(Infrastructure);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async findAll(userId: number, filters?: {
        search?: string;
        infraType?: string;
        categoryId?: number;
        isFavorite?: boolean;
        tagIds?: number[];
    }) {
        const queryBuilder = this.infraRepository.createQueryBuilder('infra')
            .leftJoinAndSelect('infra.category', 'category')
            .where('infra.userId = :userId', { userId });

        if (filters?.search) {
            queryBuilder.andWhere(
                '(infra.title LIKE :search OR infra.description LIKE :search OR infra.content LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }
        if (filters?.infraType) {
            queryBuilder.andWhere('infra.infraType = :infraType', { infraType: filters.infraType });
        }
        if (filters?.categoryId) {
            queryBuilder.andWhere('infra.categoryId = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters?.isFavorite) {
            queryBuilder.andWhere('infra.isFavorite = :isFavorite', { isFavorite: filters.isFavorite });
        }

        const items = await queryBuilder
            .orderBy('infra.isFavorite', 'DESC')
            .addOrderBy('infra.updatedAt', 'DESC')
            .getMany();

        return await this.loadTags(items);
    }

    async findOne(id: number, userId: number) {
        const item = await this.infraRepository.findOne({
            where: { id, userId },
            relations: ['category']
        });
        if (!item) return null;
        const withTags = await this.loadTags([item]);
        return withTags[0] || null;
    }

    async create(userId: number, data: any) {
        const infra = new Infrastructure();
        Object.assign(infra, {
            ...data,
            userId,
            isFavorite: data.isFavorite || false,
        });

        const saved = await this.infraRepository.save(infra);
        if (data.tagIds?.length) {
            await this.syncTags(saved.id, data.tagIds);
        }
        return await this.findOne(saved.id, userId);
    }

    async update(id: number, userId: number, data: any) {
        const infra = await this.infraRepository.findOne({ where: { id, userId } });
        if (!infra) throw new Error('Not found');

        Object.assign(infra, data);
        await this.infraRepository.save(infra);

        if (data.tagIds) {
            await this.syncTags(id, data.tagIds);
        }
        return await this.findOne(id, userId);
    }

    async delete(id: number, userId: number) {
        const infra = await this.infraRepository.findOne({ where: { id, userId } });
        if (!infra) throw new Error('Not found');

        await this.taggableRepository.delete({ taggableId: id, taggableType: 'infrastructure' });
        await this.infraRepository.remove(infra);
        return { message: 'Deleted' };
    }

    async toggleFavorite(id: number, userId: number) {
        const infra = await this.infraRepository.findOne({ where: { id, userId } });
        if (!infra) throw new Error('Not found');

        infra.isFavorite = !infra.isFavorite;
        await this.infraRepository.save(infra);
        return await this.findOne(id, userId);
    }

    private async syncTags(infraId: number, tagIds: number[]) {
        await this.taggableRepository.delete({ taggableId: infraId, taggableType: 'infrastructure' });
        if (tagIds.length > 0) {
            const taggables = tagIds.map(tagId => {
                const t = new Taggable();
                t.tagId = tagId;
                t.taggableId = infraId;
                t.taggableType = 'infrastructure';
                return t;
            });
            await this.taggableRepository.save(taggables);
        }
    }

    private async loadTags(items: Infrastructure[]): Promise<any[]> {
        const result = [];
        for (const item of items) {
            const taggables = await this.taggableRepository.find({
                where: { taggableId: item.id, taggableType: 'infrastructure' },
                relations: ['tag']
            });
            result.push({ ...item, tags: taggables.map(t => t.tag) });
        }
        return result;
    }
}