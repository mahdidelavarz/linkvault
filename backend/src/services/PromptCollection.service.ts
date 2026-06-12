import { AppDataSource } from '../config/database';
import { PromptCollection } from '../entities/PromptCollection';
import { PromptCollectionItem } from '../entities/PromptCollectionItem';
import { Prompt } from '../entities/Prompt';
import { In } from 'typeorm';

export class PromptCollectionService {
    private collectionRepo = AppDataSource.getRepository(PromptCollection);
    private itemRepo = AppDataSource.getRepository(PromptCollectionItem);

    async findAll(userId: number) {
        const collections = await this.collectionRepo
            .createQueryBuilder('c')
            .where('c.userId = :userId', { userId })
            .orderBy('c.updatedAt', 'DESC')
            .getMany();

        const ids = collections.map(c => c.id);
        if (ids.length === 0) return { collections: [] };

        const counts = await this.itemRepo
            .createQueryBuilder('ci')
            .select('ci.collectionId', 'collectionId')
            .addSelect('COUNT(*)', 'count')
            .where('ci.collectionId IN (:...ids)', { ids })
            .groupBy('ci.collectionId')
            .getRawMany();

        const countMap: Record<number, number> = {};
        for (const row of counts) countMap[row.collectionId] = parseInt(row.count, 10);

        return {
            collections: collections.map(c => ({ ...c, itemCount: countMap[c.id] ?? 0 })),
        };
    }

    async findOne(id: number, userId: number) {
        const collection = await this.collectionRepo.findOne({ where: { id, userId } });
        if (!collection) return null;

        const collectionItems = await this.itemRepo.find({
            where: { collectionId: id },
            order: { sortOrder: 'ASC', addedAt: 'ASC' },
        });

        const promptIds = collectionItems.map(ci => ci.promptId);
        const prompts = promptIds.length
            ? await AppDataSource.getRepository(Prompt).findBy({ id: In(promptIds) })
            : [];
        const promptMap = new Map(prompts.map(p => [p.id, p]));

        const items = collectionItems.map(ci => ({
            promptId: ci.promptId,
            sortOrder: ci.sortOrder,
            addedAt: ci.addedAt,
            prompt: promptMap.get(ci.promptId) ?? null,
        }));

        return { ...collection, itemCount: collectionItems.length, items };
    }

    async create(userId: number, data: { title: string; description?: string; color?: string }) {
        const collection = this.collectionRepo.create({ ...data, userId });
        const saved = await this.collectionRepo.save(collection);
        return { ...saved, itemCount: 0 };
    }

    async update(id: number, userId: number, data: Partial<{ title: string; description: string; color: string }>) {
        const collection = await this.collectionRepo.findOne({ where: { id, userId } });
        if (!collection) throw new Error('Not found');
        Object.assign(collection, data);
        const saved = await this.collectionRepo.save(collection);
        const count = await this.itemRepo.count({ where: { collectionId: id } });
        return { ...saved, itemCount: count };
    }

    async delete(id: number, userId: number) {
        const collection = await this.collectionRepo.findOne({ where: { id, userId } });
        if (!collection) throw new Error('Not found');
        await this.collectionRepo.remove(collection);
        return { message: 'Deleted' };
    }

    async addItem(collectionId: number, userId: number, promptId: number) {
        const collection = await this.collectionRepo.findOne({ where: { id: collectionId, userId } });
        if (!collection) throw new Error('Collection not found');

        const maxOrder = await this.itemRepo
            .createQueryBuilder('ci')
            .select('MAX(ci.sortOrder)', 'max')
            .where('ci.collectionId = :collectionId', { collectionId })
            .getRawOne();

        const sortOrder = (maxOrder?.max ?? -1) + 1;
        const ci = this.itemRepo.create({ collectionId, promptId, sortOrder });
        return this.itemRepo.save(ci);
    }

    async removeItem(collectionId: number, userId: number, promptId: number) {
        const collection = await this.collectionRepo.findOne({ where: { id: collectionId, userId } });
        if (!collection) throw new Error('Collection not found');

        await this.itemRepo.delete({ collectionId, promptId });
        return { message: 'Removed' };
    }

    async getItemMembership(promptId: number, userId: number) {
        const rows = await this.itemRepo
            .createQueryBuilder('ci')
            .innerJoin('ci.collection', 'c')
            .where('ci.promptId = :promptId', { promptId })
            .andWhere('c.userId = :userId', { userId })
            .select(['ci.collectionId'])
            .getMany();

        if (rows.length === 0) return { collections: [] };

        const collectionIds = rows.map(r => r.collectionId);
        const collections = await this.collectionRepo.findBy({ id: In(collectionIds) });
        const counts = await this.itemRepo
            .createQueryBuilder('ci')
            .select('ci.collectionId', 'collectionId')
            .addSelect('COUNT(*)', 'count')
            .where('ci.collectionId IN (:...collectionIds)', { collectionIds })
            .groupBy('ci.collectionId')
            .getRawMany();

        const countMap: Record<number, number> = {};
        for (const row of counts) countMap[row.collectionId] = parseInt(row.count, 10);

        return { collections: collections.map(c => ({ ...c, itemCount: countMap[c.id] ?? 0 })) };
    }

    async reorderItems(collectionId: number, userId: number, order: { promptId: number; sortOrder: number }[]) {
        const collection = await this.collectionRepo.findOne({ where: { id: collectionId, userId } });
        if (!collection) throw new Error('Collection not found');

        await Promise.all(
            order.map(({ promptId, sortOrder }) =>
                this.itemRepo.update({ collectionId, promptId }, { sortOrder })
            )
        );
        return { message: 'Reordered' };
    }
}
