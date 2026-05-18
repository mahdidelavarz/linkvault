import { AppDataSource } from '../config/database';
import { Tag } from '../entities/Tag';
import { Taggable } from '../entities/Taggable';

export class TagService {
    private tagRepository = AppDataSource.getRepository(Tag);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async findAll(userId: number) {
        const tags = await this.tagRepository.find({
            where: { userId },
            order: { name: 'ASC' }
        });

        // Get counts for each tag
        const tagsWithCounts = await Promise.all(
            tags.map(async (tag) => {
                const count = await this.taggableRepository.count({
                    where: { tagId: tag.id }
                });

                return {
                    ...tag,
                    _count: {
                        items: count
                    }
                };
            })
        );

        return tagsWithCounts;
    }

    async findOne(id: number, userId: number) {
        const tag = await this.tagRepository.findOne({
            where: { id, userId }
        });

        if (!tag) {
            throw new Error('Tag not found');
        }

        const count = await this.taggableRepository.count({
            where: { tagId: id }
        });

        return {
            ...tag,
            _count: {
                items: count
            }
        };
    }

    async create(userId: number, data: { name: string }) {
        // Check for duplicate name
        const existing = await this.tagRepository.findOne({
            where: { name: data.name, userId }
        });

        if (existing) {
            throw new Error('Tag with this name already exists');
        }

        const tag = new Tag();
        tag.name = data.name;
        tag.userId = userId;

        await this.tagRepository.save(tag);
        return await this.findOne(tag.id, userId);
    }

    async update(id: number, userId: number, data: { name: string }) {
        const tag = await this.tagRepository.findOne({
            where: { id, userId }
        });

        if (!tag) {
            throw new Error('Tag not found');
        }

        // Check for duplicate name
        const existing = await this.tagRepository.findOne({
            where: { name: data.name, userId }
        });

        if (existing && existing.id !== id) {
            throw new Error('Tag with this name already exists');
        }

        tag.name = data.name;
        await this.tagRepository.save(tag);
        
        return await this.findOne(id, userId);
    }

    async delete(id: number, userId: number) {
        const tag = await this.tagRepository.findOne({
            where: { id, userId }
        });

        if (!tag) {
            throw new Error('Tag not found');
        }

        // Delete all taggable relations
        await this.taggableRepository.delete({ tagId: id });
        
        // Delete the tag
        await this.tagRepository.remove(tag);
        
        return { message: 'Tag deleted successfully' };
    }
}