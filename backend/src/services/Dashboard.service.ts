import { AppDataSource } from '../config/database';
import { Link } from '../entities/Link';
import { Note } from '../entities/Note';
import { Snippet } from '../entities/Snippet';
import { Prompt } from '../entities/Prompt';
import { Infrastructure } from '../entities/Infrastructure';
import { Category } from '../entities/Category';
import { Tag } from '../entities/Tag';

export class DashboardService {
    private linkRepository = AppDataSource.getRepository(Link);
    private noteRepository = AppDataSource.getRepository(Note);
    private snippetRepository = AppDataSource.getRepository(Snippet);
    private promptRepository = AppDataSource.getRepository(Prompt);
    private infrastructureRepository = AppDataSource.getRepository(Infrastructure);
    private categoryRepository = AppDataSource.getRepository(Category);
    private tagRepository = AppDataSource.getRepository(Tag);

    async getStats(userId: number) {
        const [
            totalLinks, favoriteLinks, recentLinks,
            totalNotes, pinnedNotes, recentNotes,
            totalSnippets, favoriteSnippets, recentSnippets,
            totalPrompts, favoritePrompts, recentPrompts,
            totalCategories, totalTags
        ] = await Promise.all([
            // Links
            this.linkRepository.count({ where: { userId } }),
            this.linkRepository.count({ where: { userId, isFavorite: true } }),
            this.linkRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: 5,
                relations: ['category']
            }),

            // Notes
            this.noteRepository.count({ where: { userId } }),
            this.noteRepository.count({ where: { userId, isPinned: true } }),
            this.noteRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: 5,
                relations: ['category']
            }),

            // Snippets
            this.snippetRepository.count({ where: { userId } }),
            this.snippetRepository.count({ where: { userId, isFavorite: true } }),
            this.snippetRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: 5,
                relations: ['category']
            }),

            // Prompts
            this.promptRepository.count({ where: { userId } }),
            this.promptRepository.count({ where: { userId, isFavorite: true } }),
            this.promptRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: 5,
                relations: ['category']
            }),

            // Categories & Tags
            this.categoryRepository.count({ where: { userId } }),
            this.tagRepository.count({ where: { userId } }),
        ]);

        return {
            links: {
                total: totalLinks,
                favorites: favoriteLinks,
                recentlyAdded: recentLinks,
            },
            notes: {
                total: totalNotes,
                pinned: pinnedNotes,
                recentlyAdded: recentNotes,
            },
            snippets: {
                total: totalSnippets,
                favorites: favoriteSnippets,
                recentlyAdded: recentSnippets,
            },
            prompts: {
                total: totalPrompts,
                favorites: favoritePrompts,
                recentlyAdded: recentPrompts,
            },
            categories: {
                total: totalCategories,
            },
            tags: {
                total: totalTags,
            },
        };
    }

    async getRecentItems(userId: number, limit = 20) {
        const [recentLinks, recentNotes, recentSnippets, recentPrompts, recentInfra] = await Promise.all([
            this.linkRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: limit,
                relations: ['category']
            }),
            this.noteRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: limit,
                relations: ['category']
            }),
            this.snippetRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: limit,
                relations: ['category']
            }),
            this.promptRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: limit,
                relations: ['category']
            }),
            this.infrastructureRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
                take: limit,
                relations: ['category']
            }),
        ]);

        // Combine and sort by date
        const allItems = [
            ...recentLinks.map(l => ({
                id: l.id,
                title: l.title,
                type: 'link' as const,
                updatedAt: l.updatedAt,
                category: l.category?.name,
                url: l.url,
                isFavorite: l.isFavorite,
            })),
            ...recentNotes.map(n => ({
                id: n.id,
                title: n.title,
                type: 'note' as const,
                updatedAt: n.updatedAt,
                category: n.category?.name,
                content: n.content,
                isPinned: n.isPinned,
            })),
            ...recentSnippets.map(s => ({
                id: s.id,
                title: s.title,
                type: 'snippet' as const,
                updatedAt: s.updatedAt,
                category: s.category?.name,
                content: s.content,
                language: s.language,
                snippetType: s.snippetType,
                isFavorite: s.isFavorite,
            })),
            ...recentPrompts.map(p => ({
                id: p.id,
                title: p.title,
                type: 'prompt' as const,
                updatedAt: p.updatedAt,
                category: p.category?.name,
                content: p.content,
                promptType: p.promptType,
                isFavorite: p.isFavorite,
            })),
            ...recentInfra.map(i => ({
                id: i.id,
                title: i.title,
                type: 'infrastructure' as const,
                updatedAt: i.updatedAt,
                category: i.category?.name,
                content: i.content,
                infraType: i.infraType,
                isFavorite: i.isFavorite,
            })),
        ];

        // Sort by most recently updated
        allItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

        return allItems.slice(0, limit);
    }
}