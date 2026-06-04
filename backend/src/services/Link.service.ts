import axios from 'axios';
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
        filters?: { search?: string; categoryId?: number; isFavorite?: boolean; tagIds?: number[] },
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
        if (filters?.tagIds && filters.tagIds.length > 0) {
            const linkIds = await this.getItemIdsByTags('link', filters.tagIds);
            if (linkIds.length === 0) return { items: [], total: 0, page, limit, hasMore: false };
            queryBuilder.andWhere('link.id IN (:...linkIds)', { linkIds });
        }

        const [raw, total] = await queryBuilder
            .orderBy('link.updatedAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const items = await this.loadTagsForLinks(raw);
        return { items, total, page, limit, hasMore: skip + raw.length < total };
    }

    private async getItemIdsByTags(type: string, tagIds: number[]): Promise<number[]> {
        const taggables = await this.taggableRepository.find({ where: { taggableType: type } });
        return taggables
            .filter(t => tagIds.map(Number).includes(Number(t.tagId)))
            .map(t => t.taggableId);
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

    async fetchMeta(url: string): Promise<{
        title?: string;
        description?: string;
        favicon?: string;
    }> {
        const response = await axios.get(url, {
            timeout: 8000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkVault-Bot/1.0)' },
            responseType: 'text',
            maxRedirects: 5,
        });

        const html: string = response.data;

        const meta = (name: string) => {
            const r1 = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'));
            const r2 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'));
            return (r1 || r2)?.[1]?.trim();
        };

        const rawTitle = meta('og:title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
        const description = meta('og:description') || meta('description');

        // Favicon: check explicit <link rel="icon"> first, fall back to Google
        const faviconHref = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)?.[1]
            || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i)?.[1];

        let favicon: string | undefined;
        if (faviconHref) {
            try {
                const base = new URL(url).origin;
                favicon = faviconHref.startsWith('http') ? faviconHref
                    : faviconHref.startsWith('/') ? `${base}${faviconHref}`
                    : `${base}/${faviconHref}`;
            } catch { /* ignore */ }
        }

        return {
            title: rawTitle?.substring(0, 255),
            description: description?.substring(0, 1000),
            favicon,
        };
    }

    private async loadTagsForLinks(links: Link[]): Promise<any[]> {
        const withTags = await loadTagsForItems(links, 'link');
        return withTags.map(link => ({
            ...link,
            passwordEncrypted: link.passwordEncrypted ? decrypt(link.passwordEncrypted) : link.passwordEncrypted,
        }));
    }
}