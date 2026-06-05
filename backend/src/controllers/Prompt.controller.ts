import { Response } from 'express';
import { PromptService } from '../services/Prompt.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const promptService = new PromptService();

const notFound = (e: any) => { throw e.message === 'Prompt not found' ? new HttpError(404, e.message) : e; };

export class PromptController {
    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { search, categoryId, promptType, targetAI, isFavorite, tagIds, page, limit } = req.query;

        const filters: any = {};
        if (search) filters.search = search as string;
        if (categoryId) filters.categoryId = parseInt(categoryId as string);
        if (promptType) filters.promptType = promptType as string;
        if (targetAI) filters.targetAI = targetAI as string;
        if (isFavorite) filters.isFavorite = isFavorite === 'true';
        if (tagIds) filters.tagIds = (tagIds as string).split(',').map(Number);

        const pagination = {
            page: parseInt(page as string) || 1,
            limit: Math.min(parseInt(limit as string) || 20, 100),
        };

        res.json(await promptService.findAll(userId, filters, pagination));
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        const prompt = await promptService.findOne(parseParamId(req.params.id)!, req.userId!);
        if (!prompt) throw new HttpError(404, 'Prompt not found');
        res.json({ prompt });
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        const prompt = await promptService.create(req.userId!, req.body);
        res.status(201).json({ prompt });
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const prompt = await promptService.update(parseParamId(req.params.id)!, req.userId!, req.body);
            res.json({ prompt });
        } catch (e: any) { notFound(e); }
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            res.json(await promptService.delete(parseParamId(req.params.id)!, req.userId!));
        } catch (e: any) { notFound(e); }
    });

    toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const prompt = await promptService.toggleFavorite(parseParamId(req.params.id)!, req.userId!);
            res.json({ prompt });
        } catch (e: any) { notFound(e); }
    });

    incrementUsage = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const prompt = await promptService.incrementUsage(parseParamId(req.params.id)!, req.userId!);
            res.json({ prompt });
        } catch (e: any) { notFound(e); }
    });

    getVersions = asyncHandler(async (req: AuthRequest, res: Response) => {
        const data = await promptService.getRawVersions(parseParamId(req.params.id)!, req.userId!);
        if (!data) throw new HttpError(404, 'Prompt not found');
        res.json(data);
    });
}
