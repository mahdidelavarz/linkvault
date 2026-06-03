import { AppDataSource } from '../config/database';
import { Link } from '../entities/Link';
import { Taggable } from '../entities/Taggable';
import { encrypt, decrypt } from '../utils/crypto';
import { loadTagsForItems } from '../utils/tagLoader';

export class LinkService {
    private linkRepository = AppDataSource.getRepository(Link);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async findAll(
        userId: number,
        filters?: { search?: string; categoryId?: number; isFavorite?: boolean },
        pagination = { page: 1, limit: 20 }
    ) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const queryBuilder = this.linkRepository.createQueryBuilder('link')
            .leftJoinAndSelect('link.category', 'category')
            .where('link.userId = :userId', { userId });

        if (filters?.search) {
            queryBuilder.andWhere(
                '(link.title LIKE :search OR link.description LIKE :search OR link.url LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }
        if (filters?.categoryId) {
            queryBuilder.andWhere('link.categoryId = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters?.isFavorite !== undefined) {
            queryBuilder.andWhere('link.isFavorite = :isFavorite', { isFavorite: filters.isFavorite });
        }

        const [raw, total] = await queryBuilder
            .orderBy('link.updatedAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const items = await this.loadTagsForLinks(raw);
        return { items, total, page, limit, hasMore: skip + raw.length < total };
    }

    async findOne(id: number, userId: number) {
        const link = await this.linkRepository.findOne({
            where: { id, userId },
            relations: ['category']
        });
        
        if (!link) return null;
        
        const linksWithTags = await this.loadTagsForLinks([link]);
        return linksWithTags[0] || null;
    }

    async create(userId: number, data: {
        url: string;
        title: string;
        description?: string;
        username?: string;
        password?: string;
        email?: string;
        phone?: string;
        isFavorite?: boolean;
        categoryId?: number | null;
        tagIds?: number[];
    }) {
        // Create new link instance
        const link = new Link();
        link.url = data.url;
        link.title = data.title;
        link.description = data.description || '';
        link.username = data.username || '';
        link.passwordEncrypted = data.password ? encrypt(data.password) : '';
        link.email = data.email || '';
        link.phone = data.phone || '';
        link.isFavorite = data.isFavorite || false;
        link.userId = userId;
        
        if (data.categoryId) {
            link.categoryId = data.categoryId;
        }

        const savedLink = await this.linkRepository.save(link);

        // Handle tags
        if (data.tagIds && data.tagIds.length > 0) {
            await this.syncTags(savedLink.id, data.tagIds);
        }

        return await this.findOne(savedLink.id, userId);
    }

    async update(id: number, userId: number, data: {
        url?: string;
        title?: string;
        description?: string;
        username?: string;
        password?: string;
        email?: string;
        phone?: string;
        isFavorite?: boolean;
        categoryId?: number | null;
        tagIds?: number[];
    }) {
        const link = await this.linkRepository.findOne({ where: { id, userId } });
        
        if (!link) {
            throw new Error('Link not found');
        }

        // Update fields
        if (data.url !== undefined) link.url = data.url;
        if (data.title !== undefined) link.title = data.title;
        if (data.description !== undefined) link.description = data.description;
        if (data.username !== undefined) link.username = data.username;
        if (data.password !== undefined) link.passwordEncrypted = data.password ? encrypt(data.password) : '';
        if (data.email !== undefined) link.email = data.email;
        if (data.phone !== undefined) link.phone = data.phone;
        if (data.isFavorite !== undefined) link.isFavorite = data.isFavorite;
        if (data.categoryId !== undefined && data.categoryId !== null) {
            link.categoryId = data.categoryId;
        }

        await this.linkRepository.save(link);

        // Handle tags if provided
        if (data.tagIds) {
            await this.syncTags(id, data.tagIds);
        }

        return await this.findOne(id, userId);
    }

    async delete(id: number, userId: number) {
        const link = await this.linkRepository.findOne({ where: { id, userId } });
        
        if (!link) {
            throw new Error('Link not found');
        }

        // Delete related taggables first
        await this.taggableRepository.delete({ 
            taggableId: id, 
            taggableType: 'link' 
        });
        
        // Delete the link
        await this.linkRepository.remove(link);
        
        return { message: 'Link deleted successfully' };
    }

    async toggleFavorite(id: number, userId: number) {
        const link = await this.linkRepository.findOne({ where: { id, userId } });
        
        if (!link) {
            throw new Error('Link not found');
        }

        link.isFavorite = !link.isFavorite;
        await this.linkRepository.save(link);
        
        return await this.findOne(id, userId);
    }

    private async syncTags(linkId: number, tagIds: number[]) {
        // Remove existing tags for this link
        await this.taggableRepository.delete({ 
            taggableId: linkId, 
            taggableType: 'link' 
        });
        
        // Add new tags
        if (tagIds.length > 0) {
            const taggablesToSave: Taggable[] = [];
            
            for (const tagId of tagIds) {
                const taggable = new Taggable();
                taggable.tagId = tagId;
                taggable.taggableId = linkId;
                taggable.taggableType = 'link';
                taggablesToSave.push(taggable);
            }
            
            await this.taggableRepository.save(taggablesToSave);
        }
    }

    private async loadTagsForLinks(links: Link[]): Promise<any[]> {
        const withTags = await loadTagsForItems(links, 'link');
        return withTags.map(link => ({
            ...link,
            passwordEncrypted: link.passwordEncrypted ? decrypt(link.passwordEncrypted) : link.passwordEncrypted,
        }));
    }
}