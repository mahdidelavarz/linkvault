import { AppDataSource } from '../config/database';
import { Infrastructure } from '../entities/Infrastructure';
import { Taggable } from '../entities/Taggable';
import { loadTagsForItems } from '../utils/tagLoader';
import { encrypt, decrypt } from '../utils/crypto';

// Metadata fields that must be encrypted at rest for server and config infra types.
const SENSITIVE_METADATA_FIELDS = ['sshKey', 'password', 'token', 'privateKey'];

export class InfraService {
    private infraRepository = AppDataSource.getRepository(Infrastructure);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async findAll(
        userId: number,
        filters?: { search?: string; infraType?: string; categoryId?: number; isFavorite?: boolean; tagIds?: number[] },
        pagination = { page: 1, limit: 20 }
    ) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const qb = this.infraRepository.createQueryBuilder('infra')
            .leftJoinAndSelect('infra.category', 'category')
            .where('infra.userId = :userId', { userId });

        if (filters?.search) {
            qb.andWhere(
                '(infra.title LIKE :search OR infra.description LIKE :search OR infra.content LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }
        if (filters?.infraType)
            qb.andWhere('infra.infraType = :infraType', { infraType: filters.infraType });
        if (filters?.categoryId)
            qb.andWhere('infra.categoryId = :categoryId', { categoryId: filters.categoryId });
        if (filters?.isFavorite)
            qb.andWhere('infra.isFavorite = :isFavorite', { isFavorite: filters.isFavorite });
        if (filters?.tagIds && filters.tagIds.length > 0) {
            const infraIds = await this.getItemIdsByTags('infrastructure', filters.tagIds);
            if (infraIds.length === 0) return { items: [], total: 0, page, limit, hasMore: false };
            qb.andWhere('infra.id IN (:...infraIds)', { infraIds });
        }

        const [raw, total] = await qb
            .orderBy('infra.isFavorite', 'DESC')
            .addOrderBy('infra.updatedAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const withTags = await this.loadTags(raw);
        // P0-3: decrypt sensitive metadata before returning to client
        const items = withTags.map(item => this.withDecryptedMetadata(item));
        return { items, total, page, limit, hasMore: skip + raw.length < total };
    }

    async findOne(id: number, userId: number) {
        const item = await this.infraRepository.findOne({
            where: { id, userId },
            relations: ['category'],
        });
        if (!item) return null;
        const withTags = await this.loadTags([item]);
        // P0-3: decrypt sensitive metadata before returning to client
        return this.withDecryptedMetadata(withTags[0] ?? null);
    }

    async create(userId: number, data: any) {
        const infra = new Infrastructure();
        Object.assign(infra, {
            ...data,
            userId,
            isFavorite: data.isFavorite || false,
            // P0-3: encrypt sensitive metadata fields before persisting
            metadata: data.metadata ? this.encryptSensitiveMetadata(data.metadata) : undefined,
        });

        const saved = await this.infraRepository.save(infra);
        if (data.tagIds?.length) await this.syncTags(saved.id, data.tagIds);
        return await this.findOne(saved.id, userId);
    }

    async update(id: number, userId: number, data: any) {
        const infra = await this.infraRepository.findOne({ where: { id, userId } });
        if (!infra) throw new Error('Not found');

        // P0-3: encrypt sensitive metadata only when a new metadata object is provided
        const payload = { ...data };
        if (data.metadata !== undefined) {
            payload.metadata = this.encryptSensitiveMetadata(data.metadata);
        }

        Object.assign(infra, payload);
        await this.infraRepository.save(infra);

        if (data.tagIds) await this.syncTags(id, data.tagIds);
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

    // ─── Private helpers ─────────────────────────────────────────────────────────

    /**
     * P0-3: Encrypt any sensitive field in a metadata object before it reaches the DB.
     * Safe to call even when ENCRYPTION_KEY is not set — falls back to plaintext.
     * Skips fields that are already encrypted (start with 'enc:').
     */
    private encryptSensitiveMetadata(metadata: Record<string, any>): Record<string, any> {
        if (!metadata || !process.env.ENCRYPTION_KEY) return metadata;

        const result = { ...metadata };
        for (const field of SENSITIVE_METADATA_FIELDS) {
            const value = result[field];
            if (value && typeof value === 'string' && !value.startsWith('enc:')) {
                result[field] = encrypt(value);
            }
        }
        return result;
    }

    /**
     * P0-3: Decrypt any sensitive field in a metadata object before returning to client.
     * The underlying decrypt() is a no-op for values that are not encrypted.
     */
    private decryptSensitiveMetadata(metadata: Record<string, any>): Record<string, any> {
        if (!metadata) return metadata;

        const result = { ...metadata };
        for (const field of SENSITIVE_METADATA_FIELDS) {
            const value = result[field];
            if (value && typeof value === 'string') {
                result[field] = decrypt(value);
            }
        }
        return result;
    }

    /** Apply decrypted metadata to an infra DTO. */
    private withDecryptedMetadata(item: any): any {
        if (!item) return item;
        return { ...item, metadata: item.metadata ? this.decryptSensitiveMetadata(item.metadata) : item.metadata };
    }

    private async getItemIdsByTags(type: string, tagIds: number[]): Promise<number[]> {
        const taggables = await this.taggableRepository.find({ where: { taggableType: type } });
        return taggables
            .filter(t => tagIds.map(Number).includes(Number(t.tagId)))
            .map(t => t.taggableId);
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
        return loadTagsForItems(items, 'infrastructure');
    }
}
