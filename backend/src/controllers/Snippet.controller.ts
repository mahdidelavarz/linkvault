import { Response, NextFunction } from 'express';
import { SnippetService } from '../services/Snippet.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseParamId } from '../utils/parsParamId';


const snippetService = new SnippetService();

export class SnippetController {
    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { search, categoryId, language, isFavorite, tagIds, snippetType, page, limit } = req.query;

            const filters: any = {};
            if (search) filters.search = search as string;
            if (categoryId) filters.categoryId = parseInt(categoryId as string);
            if (language) filters.language = language as string;
            if (isFavorite) filters.isFavorite = isFavorite === 'true';
            if (tagIds) filters.tagIds = (tagIds as string).split(',').map(Number);
            if (snippetType) filters.snippetType = snippetType as string;

            const pagination = {
                page: parseInt(page as string) || 1,
                limit: Math.min(parseInt(limit as string) || 20, 100),
            };

            const result = await snippetService.findAll(userId, filters, pagination);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const snippet = await snippetService.findOne(id, userId);

                if (!snippet) {
                    return res.status(404).json({ message: 'Snippet not found' });
                }

                res.json({ snippet });
            }
        } catch (error) {
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const snippet = await snippetService.create(userId, req.body);
            res.status(201).json({ snippet });
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const snippet = await snippetService.update(id, userId, req.body);
                res.json({ snippet });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Snippet not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const result = await snippetService.delete(id, userId);
                res.json(result);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Snippet not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }

    async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const snippet = await snippetService.toggleFavorite(id, userId);
                res.json({ snippet });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Snippet not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }
}