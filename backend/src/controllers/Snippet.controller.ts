import { Response } from 'express';
import { SnippetService } from '../services/Snippet.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const snippetService = new SnippetService();

export class SnippetController {
    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
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

        res.json(await snippetService.findAll(userId, filters, pagination));
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        const snippet = await snippetService.findOne(parseParamId(req.params.id)!, req.userId!);
        if (!snippet) throw new HttpError(404, 'Snippet not found');
        res.json({ snippet });
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        const snippet = await snippetService.create(req.userId!, req.body);
        res.status(201).json({ snippet });
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const snippet = await snippetService.update(parseParamId(req.params.id)!, req.userId!, req.body);
            res.json({ snippet });
        } catch (e: any) {
            throw e.message === 'Snippet not found' ? new HttpError(404, e.message) : e;
        }
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            res.json(await snippetService.delete(parseParamId(req.params.id)!, req.userId!));
        } catch (e: any) {
            throw e.message === 'Snippet not found' ? new HttpError(404, e.message) : e;
        }
    });

    toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const snippet = await snippetService.toggleFavorite(parseParamId(req.params.id)!, req.userId!);
            res.json({ snippet });
        } catch (e: any) {
            throw e.message === 'Snippet not found' ? new HttpError(404, e.message) : e;
        }
    });
}
