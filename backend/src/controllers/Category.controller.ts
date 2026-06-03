import { Response } from 'express';
import { CategoryService } from '../services/Category.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const categoryService = new CategoryService();

export class CategoryController {
    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
        const categories = await categoryService.findAll(req.userId!);
        res.json({ categories });
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const category = await categoryService.findOne(parseParamId(req.params.id)!, req.userId!);
            res.json({ category });
        } catch (e: any) {
            throw e.message === 'Category not found' ? new HttpError(404, e.message) : e;
        }
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const category = await categoryService.create(req.userId!, req.body);
            res.status(201).json({ category });
        } catch (e: any) {
            throw e.message?.includes('already exists') ? new HttpError(409, e.message) : e;
        }
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const category = await categoryService.update(parseParamId(req.params.id)!, req.userId!, req.body);
            res.json({ category });
        } catch (e: any) {
            if (e.message === 'Category not found') throw new HttpError(404, e.message);
            if (e.message === 'Category cannot be its own parent') throw new HttpError(400, e.message);
            throw e;
        }
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            res.json(await categoryService.delete(parseParamId(req.params.id)!, req.userId!));
        } catch (e: any) {
            throw e.message === 'Category not found' ? new HttpError(404, e.message) : e;
        }
    });

    getTree = asyncHandler(async (req: AuthRequest, res: Response) => {
        const tree = await categoryService.getCategoryTree(req.userId!);
        res.json({ tree });
    });
}
