import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';
import { Link } from '../entities/Link';
import { Note } from '../entities/Note';
import { IsNull } from 'typeorm';

export class CategoryService {
    private categoryRepository = AppDataSource.getRepository(Category);
    private linkRepository = AppDataSource.getRepository(Link);
    private noteRepository = AppDataSource.getRepository(Note);

    async findAll(userId: number) {
        const categories = await this.categoryRepository.find({
            where: { userId },
            relations: ['parent', 'children'],
            order: { name: 'ASC' }
        });

        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const linkCount = await this.linkRepository.count({
                    where: { categoryId: category.id, userId }
                });
                const noteCount = await this.noteRepository.count({
                    where: { categoryId: category.id, userId }
                });

                return {
                    ...category,
                    _count: {
                        links: linkCount,
                        notes: noteCount
                    }
                };
            })
        );

        return categoriesWithCounts;
    }

    async findOne(id: number, userId: number) {
        const category = await this.categoryRepository.findOne({
            where: { id, userId },
            relations: ['parent', 'children']
        });

        if (!category) {
            return null;
        }

        const linkCount = await this.linkRepository.count({
            where: { categoryId: id, userId }
        });
        const noteCount = await this.noteRepository.count({
            where: { categoryId: id, userId }
        });

        return {
            ...category,
            _count: {
                links: linkCount,
                notes: noteCount
            }
        };
    }

    async create(userId: number, data: { name: string; parentId?: number | null }) {
        const whereCondition: any = {
            name: data.name,
            userId
        };

        if (data.parentId) {
            whereCondition.parentId = data.parentId;
        } else {
            whereCondition.parentId = IsNull();
        }

        const existing = await this.categoryRepository.findOne({
            where: whereCondition
        });

        if (existing) {
            throw new Error('Category with this name already exists in this location');
        }

        // Create and save category
        const category = new Category();
        category.name = data.name;
        category.userId = userId;
        if (data.parentId)
            category.parentId = data.parentId;

        const savedCategory = await this.categoryRepository.save(category);

        return await this.findOne(savedCategory.id, userId);
    }

    async update(id: number, userId: number, data: { name?: string; parentId?: number | null }) {
        const category = await this.categoryRepository.findOne({
            where: { id, userId }
        });

        if (!category) {
            throw new Error('Category not found');
        }

        if (data.parentId && data.parentId === id) {
            throw new Error('Category cannot be its own parent');
        }

        if (data.name) category.name = data.name;
        if (data.parentId) {
            category.parentId = data.parentId;
        }

        await this.categoryRepository.save(category);

        return await this.findOne(id, userId);
    }

    async delete(id: number, userId: number) {
        const category = await this.categoryRepository.findOne({
            where: { id, userId },
            relations: ['children']
        });

        if (!category) {
            throw new Error('Category not found');
        }

        // Remove category from links and notes
        await this.linkRepository.update(
            { categoryId: id, userId },
            { categoryId: undefined }
        );
        await this.noteRepository.update(
            { categoryId: id, userId },
            { categoryId: undefined }
        );

        // Move children to parent or root
        const children = await this.categoryRepository.find({
            where: { parentId: id, userId }
        });

        if (children.length > 0) {
            const newParentId = category.parentId || undefined;
            await this.categoryRepository.update(
                { parentId: id, userId },
                { parentId: newParentId }
            );
        }

        await this.categoryRepository.remove(category);
        return { message: 'Category deleted successfully' };
    }

    async getCategoryTree(userId: number) {
        const categories = await this.categoryRepository.find({
            where: { userId },
            relations: ['children']
        });

        const buildTree = (parentId?: number): any[] => {
            return categories
                .filter(cat => cat.parentId === parentId)
                .map(cat => ({
                    ...cat,
                    children: buildTree(cat.id)
                }));
        };

        return buildTree(undefined);
    }
}