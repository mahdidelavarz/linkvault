import { Response } from 'express';
import { LinkService } from '../services/Link.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const linkService = new LinkService();

export class LinkController {
    fetchMeta = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { url } = req.query;
        if (!url || typeof url !== 'string') throw new HttpError(400, 'url query param is required');
        try {
            new URL(url); // validate
        } catch {
            throw new HttpError(400, 'Invalid URL');
        }
        try {
            const meta = await linkService.fetchMeta(url);
            res.json(meta);
        } catch {
            // Always return an empty object — the frontend gracefully handles missing meta
            res.json({});
        }
    });

    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { search, categoryId, isFavorite, tagIds, page, limit } = req.query;

        const filters: any = {};
        if (search) filters.search = search as string;
        if (categoryId) filters.categoryId = parseInt(categoryId as string);
        if (isFavorite) filters.isFavorite = isFavorite === 'true';
        if (tagIds) filters.tagIds = (tagIds as string).split(',').map(Number);

        const pagination = {
            page: parseInt(page as string) || 1,
            limit: Math.min(parseInt(limit as string) || 20, 100),
        };

        res.json(await linkService.findAll(userId, filters, pagination));
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseParamId(req.params.id)!;
        const link = await linkService.findOne(id, req.userId!);
        if (!link) throw new HttpError(404, 'Link not found');
        res.json({ link });
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        const linkData = {
            ...req.body,
            categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
        };
        const link = await linkService.create(req.userId!, linkData);
        res.status(201).json({ link });
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseParamId(req.params.id)!;
        const linkData = {
            ...req.body,
            categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
        };
        try {
            const link = await linkService.update(id, req.userId!, linkData);
            res.json({ link });
        } catch (e: any) {
            throw e.message === 'Link not found' ? new HttpError(404, e.message) : e;
        }
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseParamId(req.params.id)!;
        try {
            res.json(await linkService.delete(id, req.userId!));
        } catch (e: any) {
            throw e.message === 'Link not found' ? new HttpError(404, e.message) : e;
        }
    });

    toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseParamId(req.params.id)!;
        try {
            const link = await linkService.toggleFavorite(id, req.userId!);
            res.json({ link });
        } catch (e: any) {
            throw e.message === 'Link not found' ? new HttpError(404, e.message) : e;
        }
    });
}
