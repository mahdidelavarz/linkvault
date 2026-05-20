import { AppDataSource } from '../config/database';
import { ApiEndpoint } from '../entities/ApiEndpoint';
import { ApiCollection } from '../entities/ApiCollection';
import { Taggable } from '../entities/Taggable';
import axios from 'axios';

export class ApiService {
    private endpointRepository = AppDataSource.getRepository(ApiEndpoint);
    private collectionRepository = AppDataSource.getRepository(ApiCollection);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    // Collections
    async getCollections(userId: number) {
        const collections = await this.collectionRepository.find({
            where: { userId },
            order: { name: 'ASC' }
        });

        const collectionsWithCount = await Promise.all(
            collections.map(async (col) => {
                const count = await this.endpointRepository.count({
                    where: { collectionId: col.id, userId }
                });
                return { ...col, _count: { endpoints: count } };
            })
        );

        return collectionsWithCount;
    }

    async createCollection(userId: number, data: { name: string; description?: string }) {
        const collection = new ApiCollection();
        collection.name = data.name;
        collection.description = data.description || '';
        collection.userId = userId;

        return await this.collectionRepository.save(collection);
    }

    async deleteCollection(id: number, userId: number) {
        const collection = await this.collectionRepository.findOne({ where: { id, userId } });
        if (!collection) throw new Error('Collection not found');

        // Unlink endpoints
        await this.endpointRepository.update(
            { collectionId: id, userId },
            { collectionId: undefined as any }
        );

        await this.collectionRepository.remove(collection);
        return { message: 'Collection deleted' };
    }

    // Endpoints
    async getEndpoints(userId: number, filters?: {
        collectionId?: number;
        categoryId?: number;
        search?: string;
        method?: string;
        isFavorite?: boolean;
    }) {
        const queryBuilder = this.endpointRepository.createQueryBuilder('endpoint')
            .leftJoinAndSelect('endpoint.collection', 'collection')
            .leftJoinAndSelect('endpoint.category', 'category')
            .where('endpoint.userId = :userId', { userId });

        if (filters?.collectionId) {
            queryBuilder.andWhere('endpoint.collectionId = :collectionId', { collectionId: filters.collectionId });
        }
        if (filters?.categoryId) {
            queryBuilder.andWhere('endpoint.categoryId = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters?.search) {
            queryBuilder.andWhere('(endpoint.title LIKE :search OR endpoint.url LIKE :search)', 
                { search: `%${filters.search}%` });
        }
        if (filters?.method) {
            queryBuilder.andWhere('endpoint.method = :method', { method: filters.method });
        }
        if (filters?.isFavorite) {
            queryBuilder.andWhere('endpoint.isFavorite = :isFavorite', { isFavorite: filters.isFavorite });
        }

        const endpoints = await queryBuilder
            .orderBy('endpoint.updatedAt', 'DESC')
            .getMany();

        return await this.loadTags(endpoints);
    }

    async getEndpoint(id: number, userId: number) {
        const endpoint = await this.endpointRepository.findOne({
            where: { id, userId },
            relations: ['collection', 'category']
        });
        if (!endpoint) throw new Error('Endpoint not found');
        return (await this.loadTags([endpoint]))[0];
    }

    async createEndpoint(userId: number, data: any) {
        const endpoint = new ApiEndpoint();
        Object.assign(endpoint, {
            ...data,
            userId,
            authType: data.authType || 'none',
            isFavorite: data.isFavorite || false,
        });

        const saved = await this.endpointRepository.save(endpoint);
        if (data.tagIds?.length) {
            await this.syncTags(saved.id, data.tagIds);
        }
        return await this.getEndpoint(saved.id, userId);
    }

    async updateEndpoint(id: number, userId: number, data: any) {
        const endpoint = await this.endpointRepository.findOne({ where: { id, userId } });
        if (!endpoint) throw new Error('Endpoint not found');

        Object.assign(endpoint, data);
        await this.endpointRepository.save(endpoint);

        if (data.tagIds) {
            await this.syncTags(id, data.tagIds);
        }
        return await this.getEndpoint(id, userId);
    }

    async deleteEndpoint(id: number, userId: number) {
        const endpoint = await this.endpointRepository.findOne({ where: { id, userId } });
        if (!endpoint) throw new Error('Endpoint not found');

        await this.taggableRepository.delete({ taggableId: id, taggableType: 'api_endpoint' });
        await this.endpointRepository.remove(endpoint);
        return { message: 'Endpoint deleted' };
    }

    // Test endpoint
    async testEndpoint(userId: number, data: {
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: string;
        bodyType?: string;
    }) {
        const startTime = Date.now();
        
        try {
            const config: any = {
                method: data.method.toLowerCase(),
                url: data.url,
                headers: data.headers || {},
                validateStatus: () => true,
                timeout: 30000,
            };

            if (data.body && data.method !== 'GET') {
                config.data = data.bodyType === 'json' ? JSON.parse(data.body) : data.body;
            }

            const response = await axios(config);
            const endTime = Date.now();

            const responseBody = typeof response.data === 'object' 
                ? JSON.stringify(response.data, null, 2) 
                : String(response.data);

            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers as Record<string, string>,
                body: responseBody,
                time: endTime - startTime,
                size: new Blob([responseBody]).size,
            };
        } catch (error: any) {
            const endTime = Date.now();
            if (error.response) {
                return {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: error.response.headers,
                    body: JSON.stringify(error.response.data, null, 2),
                    time: endTime - startTime,
                    size: 0,
                };
            }
            throw error;
        }
    }

    private async syncTags(endpointId: number, tagIds: number[]) {
        await this.taggableRepository.delete({ taggableId: endpointId, taggableType: 'api_endpoint' });
        if (tagIds.length > 0) {
            const taggables = tagIds.map(tagId => {
                const t = new Taggable();
                t.tagId = tagId;
                t.taggableId = endpointId;
                t.taggableType = 'api_endpoint';
                return t;
            });
            await this.taggableRepository.save(taggables);
        }
    }

    private async loadTags(endpoints: ApiEndpoint[]): Promise<any[]> {
        const result = [];
        for (const ep of endpoints) {
            const taggables = await this.taggableRepository.find({
                where: { taggableId: ep.id, taggableType: 'api_endpoint' },
                relations: ['tag']
            });
            result.push({ ...ep, tags: taggables.map(t => t.tag) });
        }
        return result;
    }
}