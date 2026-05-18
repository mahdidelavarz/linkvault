import { Request, Response, NextFunction } from 'express';
import { TagService } from '../services/Tag.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseParamId } from '../utils/parsParamId';


const tagService = new TagService();

export class TagController {
    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const tags = await tagService.findAll(userId);
            res.json({ tags });
        } catch (error) {
            next(error);
        }
    }

    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const tag = await tagService.findOne(id, userId);
                res.json({ tag });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Tag not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const tag = await tagService.create(userId, req.body);
            res.status(201).json({ tag });
        } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                return res.status(409).json({ message: error.message });
            }
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const tag = await tagService.update(id, userId, req.body);
                res.json({ tag });
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Tag not found') {
                    return res.status(404).json({ message: error.message });
                }
                if (error.message.includes('already exists')) {
                    return res.status(409).json({ message: error.message });
                }
            }
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const result = await tagService.delete(id, userId);
                res.json(result);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Tag not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }
}