import { AppDataSource } from '../config/database';
import { Project } from '../entities/Project';
import { ProjectItem } from '../entities/ProjectItem';
import { Link } from '../entities/Link';
import { Note } from '../entities/Note';
import { Snippet } from '../entities/Snippet';
import { Prompt } from '../entities/Prompt';
import { Infrastructure } from '../entities/Infrastructure';
import { In } from 'typeorm';

export class ProjectService {
    private projectRepo = AppDataSource.getRepository(Project);
    private itemRepo = AppDataSource.getRepository(ProjectItem);

    async findAll(userId: number) {
        const projects = await this.projectRepo
            .createQueryBuilder('p')
            .where('p.userId = :userId', { userId })
            .orderBy('p.updatedAt', 'DESC')
            .getMany();

        const ids = projects.map(p => p.id);
        if (ids.length === 0) return { projects: [] };

        const counts = await this.itemRepo
            .createQueryBuilder('pi')
            .select('pi.projectId', 'projectId')
            .addSelect('COUNT(*)', 'count')
            .where('pi.projectId IN (:...ids)', { ids })
            .groupBy('pi.projectId')
            .getRawMany();

        const countMap: Record<number, number> = {};
        for (const row of counts) countMap[row.projectId] = parseInt(row.count, 10);

        return {
            projects: projects.map(p => ({ ...p, itemCount: countMap[p.id] ?? 0 })),
        };
    }

    async findOne(id: number, userId: number) {
        const project = await this.projectRepo.findOne({ where: { id, userId } });
        if (!project) return null;

        const projectItems = await this.itemRepo.find({
            where: { projectId: id },
            order: { sortOrder: 'ASC', addedAt: 'ASC' },
        });

        const resolved = await this.resolveItems(projectItems);
        return { ...project, itemCount: projectItems.length, items: resolved };
    }

    async create(userId: number, data: { title: string; description?: string; color?: string; emoji?: string }) {
        const project = this.projectRepo.create({ ...data, userId });
        const saved = await this.projectRepo.save(project);
        return { ...saved, itemCount: 0 };
    }

    async update(id: number, userId: number, data: Partial<{ title: string; description: string; color: string; emoji: string }>) {
        const project = await this.projectRepo.findOne({ where: { id, userId } });
        if (!project) throw new Error('Not found');
        Object.assign(project, data);
        const saved = await this.projectRepo.save(project);
        const count = await this.itemRepo.count({ where: { projectId: id } });
        return { ...saved, itemCount: count };
    }

    async delete(id: number, userId: number) {
        const project = await this.projectRepo.findOne({ where: { id, userId } });
        if (!project) throw new Error('Not found');
        await this.projectRepo.remove(project);
        return { message: 'Deleted' };
    }

    async addItem(projectId: number, userId: number, itemType: string, itemId: number) {
        const project = await this.projectRepo.findOne({ where: { id: projectId, userId } });
        if (!project) throw new Error('Project not found');

        const maxOrder = await this.itemRepo
            .createQueryBuilder('pi')
            .select('MAX(pi.sortOrder)', 'max')
            .where('pi.projectId = :projectId', { projectId })
            .getRawOne();

        const sortOrder = (maxOrder?.max ?? -1) + 1;
        const pi = this.itemRepo.create({ projectId, itemType, itemId, sortOrder });
        return this.itemRepo.save(pi);
    }

    async removeItem(projectId: number, userId: number, itemType: string, itemId: number) {
        const project = await this.projectRepo.findOne({ where: { id: projectId, userId } });
        if (!project) throw new Error('Project not found');

        await this.itemRepo.delete({ projectId, itemType, itemId });
        return { message: 'Removed' };
    }

    async getItemMembership(itemType: string, itemId: number, userId: number) {
        const rows = await this.itemRepo
            .createQueryBuilder('pi')
            .innerJoin('pi.project', 'p')
            .where('pi.itemType = :itemType AND pi.itemId = :itemId', { itemType, itemId })
            .andWhere('p.userId = :userId', { userId })
            .select(['pi.projectId'])
            .getMany();

        if (rows.length === 0) return { projects: [] };

        const projectIds = rows.map(r => r.projectId);
        const projects = await this.projectRepo.findBy({ id: In(projectIds) });
        const counts = await this.itemRepo
            .createQueryBuilder('pi')
            .select('pi.projectId', 'projectId')
            .addSelect('COUNT(*)', 'count')
            .where('pi.projectId IN (:...projectIds)', { projectIds })
            .groupBy('pi.projectId')
            .getRawMany();

        const countMap: Record<number, number> = {};
        for (const row of counts) countMap[row.projectId] = parseInt(row.count, 10);

        return { projects: projects.map(p => ({ ...p, itemCount: countMap[p.id] ?? 0 })) };
    }

    async reorderItems(projectId: number, userId: number, order: { itemType: string; itemId: number; sortOrder: number }[]) {
        const project = await this.projectRepo.findOne({ where: { id: projectId, userId } });
        if (!project) throw new Error('Project not found');

        await Promise.all(
            order.map(({ itemType, itemId, sortOrder }) =>
                this.itemRepo.update({ projectId, itemType, itemId }, { sortOrder })
            )
        );
        return { message: 'Reordered' };
    }

    // ─── Private helpers ─────────────────────────────────────────────────────────

    private async resolveItems(projectItems: ProjectItem[]) {
        const grouped: Record<string, number[]> = {};
        for (const pi of projectItems) {
            if (!grouped[pi.itemType]) grouped[pi.itemType] = [];
            grouped[pi.itemType].push(pi.itemId);
        }

        const fetched: Record<string, Record<number, any>> = {};

        if (grouped['link']?.length) {
            const rows = await AppDataSource.getRepository(Link).findBy({ id: In(grouped['link']) });
            fetched['link'] = Object.fromEntries(rows.map(r => [r.id, r]));
        }
        if (grouped['note']?.length) {
            const rows = await AppDataSource.getRepository(Note).findBy({ id: In(grouped['note']) });
            fetched['note'] = Object.fromEntries(rows.map(r => [r.id, r]));
        }
        if (grouped['snippet']?.length) {
            const rows = await AppDataSource.getRepository(Snippet).findBy({ id: In(grouped['snippet']) });
            fetched['snippet'] = Object.fromEntries(rows.map(r => [r.id, r]));
        }
        if (grouped['prompt']?.length) {
            const rows = await AppDataSource.getRepository(Prompt).findBy({ id: In(grouped['prompt']) });
            fetched['prompt'] = Object.fromEntries(rows.map(r => [r.id, r]));
        }
        if (grouped['infrastructure']?.length) {
            const rows = await AppDataSource.getRepository(Infrastructure).findBy({ id: In(grouped['infrastructure']) });
            fetched['infrastructure'] = Object.fromEntries(rows.map(r => [r.id, r]));
        }

        return projectItems.map(pi => ({
            itemType: pi.itemType,
            itemId: pi.itemId,
            sortOrder: pi.sortOrder,
            addedAt: pi.addedAt,
            item: fetched[pi.itemType]?.[pi.itemId] ?? null,
        }));
    }
}
