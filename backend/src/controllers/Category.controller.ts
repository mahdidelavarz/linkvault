import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/Category.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseParamId } from '../utils/parsParamId';


const categoryService = new CategoryService();

export class CategoryController {
    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const categories = await categoryService.findAll(userId);
            res.json({ categories });
        } catch (error) {
            next(error);
        }
    }

    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const category = await categoryService.findOne(id, userId);
                res.json({ category });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Category not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const category = await categoryService.create(userId, req.body);
            res.status(201).json({ category });
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
                const category = await categoryService.update(id, userId, req.body);
                res.json({ category });
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Category not found') {
                    return res.status(404).json({ message: error.message });
                }
                if (error.message === 'Category cannot be its own parent') {
                    return res.status(400).json({ message: error.message });
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
                const result = await categoryService.delete(id, userId);
                res.json(result);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Category not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }

    async getTree(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const tree = await categoryService.getCategoryTree(userId);
            res.json({ tree });
        } catch (error) {
            next(error);
        }
    }
}