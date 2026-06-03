import { Response } from 'express';
import { InfraService } from '../services/Infra.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const infraService = new InfraService();

export class InfraController {
    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
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

        res.json(await infraService.findAll(req.userId!, filters, pagination));
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        const item = await infraService.findOne(parseParamId(req.params.id)!, req.userId!);
        if (!item) throw new HttpError(404, 'Infrastructure not found');
        res.json({ infrastructure: item });
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        const item = await infraService.create(req.userId!, req.body);
        res.status(201).json({ infrastructure: item });
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        const item = await infraService.update(parseParamId(req.params.id)!, req.userId!, req.body);
        res.json({ infrastructure: item });
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        res.json(await infraService.delete(parseParamId(req.params.id)!, req.userId!));
    });

    toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
        const item = await infraService.toggleFavorite(parseParamId(req.params.id)!, req.userId!);
        res.json({ infrastructure: item });
    });
}
