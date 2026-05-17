import { Request, Response, NextFunction } from 'express';
import { LinkService } from '../services/Link.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseParamId } from '../utils/parsParamId';



const linkService = new LinkService();

export class LinkController {
    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { search, categoryId, isFavorite, tagIds } = req.query;

            const filters: any = {};
            if (search) filters.search = search as string;
            if (categoryId) filters.categoryId = parseInt(categoryId as string);
            if (isFavorite) filters.isFavorite = isFavorite === 'true';
            if (tagIds) filters.tagIds = (tagIds as string).split(',').map(Number);

            const links = await linkService.findAll(userId, filters);
            res.json({ links });
        } catch (error) {
            next(error);
        }
    }

    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {

                const link = await linkService.findOne(id, userId);
                if (!link) {
                    return res.status(404).json({ message: 'Link not found' });
                }
                res.json({ link });
            }

        } catch (error) {
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const link = await linkService.create(userId, req.body);
            res.status(201).json({ link });
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const link = await linkService.update(id, userId, req.body);
                res.json({ link });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Link not found') {
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
                const result = await linkService.delete(id, userId);
                res.json(result);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Link not found') {
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
                const link = await linkService.toggleFavorite(id, userId);
                res.json({ link });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Link not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }
}