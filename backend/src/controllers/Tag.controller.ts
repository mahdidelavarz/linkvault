import { Response } from 'express';
import { TagService } from '../services/Tag.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const tagService = new TagService();

export class TagController {
    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
        const tags = await tagService.findAll(req.userId!);
        res.json({ tags });
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const tag = await tagService.findOne(parseParamId(req.params.id)!, req.userId!);
            res.json({ tag });
        } catch (e: any) {
            throw e.message === 'Tag not found' ? new HttpError(404, e.message) : e;
        }
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const tag = await tagService.create(req.userId!, req.body);
            res.status(201).json({ tag });
        } catch (e: any) {
            throw e.message?.includes('already exists') ? new HttpError(409, e.message) : e;
        }
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const tag = await tagService.update(parseParamId(req.params.id)!, req.userId!, req.body);
            res.json({ tag });
        } catch (e: any) {
            if (e.message === 'Tag not found') throw new HttpError(404, e.message);
            if (e.message?.includes('already exists')) throw new HttpError(409, e.message);
            throw e;
        }
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            res.json(await tagService.delete(parseParamId(req.params.id)!, req.userId!));
        } catch (e: any) {
            throw e.message === 'Tag not found' ? new HttpError(404, e.message) : e;
        }
    });
}
