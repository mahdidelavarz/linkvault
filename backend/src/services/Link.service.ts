import { AppDataSource } from '../config/database';
import { Link } from '../entities/Link';
import { Taggable } from '../entities/Taggable';
import { Tag } from '../entities/Tag';

export class LinkService {
    private linkRepository = AppDataSource.getRepository(Link);
    private taggableRepository = AppDataSource.getRepository(Taggable);
    private tagRepository = AppDataSource.getRepository(Tag);

    async findAll(userId: number, filters?: {
        search?: string;
        categoryId?: number;
        isFavorite?: boolean;
    }) {
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

        const links = await queryBuilder.orderBy('link.updatedAt', 'DESC').getMany();
        
        // Load tags manually for each link
        return await this.loadTagsForLinks(links);
    }

    async findOne(id: number, userId: number) {
        const link = await this.linkRepository.findOne({
            where: { id, userId },
            relations: ['category']
        });
        
        if (!link) return null;
        
        // Load tags manually
        const linksWithTags = await this.loadTagsForLinks([link]);
        return linksWithTags[0];
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
        categoryId?: number;
        tagIds?: number[];
    }) {
        // Create link without tags first
        const link = this.linkRepository.create({
            url: data.url,
            title: data.title,
            description: data.description,
            username: data.username,
            passwordEncrypted: data.password,
            email: data.email,
            phone: data.phone,
            isFavorite: data.isFavorite || false,
            categoryId: data.categoryId,
            userId
        });

        await this.linkRepository.save(link);

        // Handle tags separately
        if (data.tagIds && data.tagIds.length > 0) {
            await this.syncTags(link.id, data.tagIds);
        }

        // Return the link with relations loaded
        return await this.findOne(link.id, userId);
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
        categoryId?: number;
        tagIds?: number[];
    }) {
        const link = await this.linkRepository.findOne({ where: { id, userId } });
        
        if (!link) {
            throw new Error('Link not found');
        }

        // Update only provided fields
        if (data.url !== undefined) link.url = data.url;
        if (data.title !== undefined) link.title = data.title;
        if (data.description !== undefined) link.description = data.description;
        if (data.username !== undefined) link.username = data.username;
        if (data.password !== undefined) link.passwordEncrypted = data.password;
        if (data.email !== undefined) link.email = data.email;
        if (data.phone !== undefined) link.phone = data.phone;
        if (data.isFavorite !== undefined) link.isFavorite = data.isFavorite;
        if (data.categoryId !== undefined) link.categoryId = data.categoryId;

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
            const taggables = tagIds.map(tagId => 
                this.taggableRepository.create({
                    tagId,
                    taggableId: linkId,
                    taggableType: 'link'
                })
            );
            
            await this.taggableRepository.save(taggables);
        }
    }

    private async loadTagsForLinks(links: Link[]): Promise<any[]> {
        const linksWithTags = [];

        for (const link of links) {
            const taggables = await this.taggableRepository.find({
                where: { 
                    taggableId: link.id, 
                    taggableType: 'link' 
                },
                relations: ['tag']
            });

            linksWithTags.push({
                ...link,
                tags: taggables.map(t => t.tag)
            });
        }

        return linksWithTags;
    }
}