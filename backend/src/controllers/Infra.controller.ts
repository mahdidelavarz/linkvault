import { Response, NextFunction } from 'express';
import { InfraService } from '../services/Infra.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseParamId } from '../utils/parsParamId';


const infraService = new InfraService();

export class InfraController {
    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { search, infraType, categoryId, isFavorite, tagIds, page, limit } = req.query;
            const filters: any = {};
            if (search) filters.search = search;
            if (infraType) filters.infraType = infraType;
            if (categoryId) filters.categoryId = parseInt(categoryId as string);
            if (isFavorite) filters.isFavorite = isFavorite === 'true';
            if (tagIds) filters.tagIds = (tagIds as string).split(',').map(Number);

            const pagination = {
                page: parseInt(page as string) || 1,
                limit: Math.min(parseInt(limit as string) || 20, 100),
            };

            const result = await infraService.findAll(req.userId!, filters, pagination);
            res.json(result);
        } catch (error) { next(error); }
    }

    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const item = await infraService.findOne(parseParamId(req.params.id)!, req.userId!);
            if (!item) return res.status(404).json({ message: 'Not found' });
            res.json({ infrastructure: item });
        } catch (error) { next(error); }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const item = await infraService.create(req.userId!, req.body);
            res.status(201).json({ infrastructure: item });
        } catch (error) { next(error); }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const item = await infraService.update(parseParamId(req.params.id)!, req.userId!, req.body);
            res.json({ infrastructure: item });
        } catch (error) { next(error); }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await infraService.delete(parseParamId(req.params.id)!, req.userId!);
            res.json(result);
        } catch (error) { next(error); }
    }

    async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const item = await infraService.toggleFavorite(parseParamId(req.params.id)!, req.userId!);
            res.json({ infrastructure: item });
        } catch (error) { next(error); }
    }
}