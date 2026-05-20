import { Response, NextFunction } from 'express';
import { PromptService } from '../services/Prompt.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseParamId } from '../utils/parsParamId';


const promptService = new PromptService();

export class PromptController {
    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { search, categoryId, promptType, targetAI, isFavorite, tagIds } = req.query;

            const filters: any = {};
            if (search) filters.search = search as string;
            if (categoryId) filters.categoryId = parseInt(categoryId as string);
            if (promptType) filters.promptType = promptType as string;
            if (targetAI) filters.targetAI = targetAI as string;
            if (isFavorite) filters.isFavorite = isFavorite === 'true';
            if (tagIds) filters.tagIds = (tagIds as string).split(',').map(Number);

            const prompts = await promptService.findAll(userId, filters);
            res.json({ prompts });
        } catch (error) {
            next(error);
        }
    }

    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {

                const prompt = await promptService.findOne(id, userId);

                if (!prompt) {
                    return res.status(404).json({ message: 'Prompt not found' });
                }

                res.json({ prompt });
            }
        } catch (error) {
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const prompt = await promptService.create(userId, req.body);
            res.status(201).json({ prompt });
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {

                const prompt = await promptService.update(id, userId, req.body);
                res.json({ prompt });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Prompt not found') {
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
                const result = await promptService.delete(id, userId);
                res.json(result);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Prompt not found') {
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
                const prompt = await promptService.toggleFavorite(id, userId);
                res.json({ prompt });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Prompt not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }

    async incrementUsage(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const prompt = await promptService.incrementUsage(id, userId);
                res.json({ prompt });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Prompt not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }
}