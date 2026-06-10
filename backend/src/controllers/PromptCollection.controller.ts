import { Response } from 'express';
import { PromptCollectionService } from '../services/PromptCollection.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const collectionService = new PromptCollectionService();

const notFound = (e: any) => { throw e.message === 'Not found' || e.message === 'Collection not found' ? new HttpError(404, e.message) : e; };

export class PromptCollectionController {
    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
        res.json(await collectionService.findAll(req.userId!));
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        const collection = await collectionService.findOne(parseParamId(req.params.id)!, req.userId!);
        if (!collection) throw new HttpError(404, 'Collection not found');
        res.json({ collection });
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        const collection = await collectionService.create(req.userId!, req.body);
        res.status(201).json({ collection });
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const collection = await collectionService.update(parseParamId(req.params.id)!, req.userId!, req.body);
            res.json({ collection });
        } catch (e: any) { notFound(e); }
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            res.json(await collectionService.delete(parseParamId(req.params.id)!, req.userId!));
        } catch (e: any) { notFound(e); }
    });

    addItem = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const { promptId } = req.body;
            const item = await collectionService.addItem(parseParamId(req.params.id)!, req.userId!, promptId);
            res.status(201).json({ item });
        } catch (e: any) { notFound(e); }
    });

    removeItem = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const promptId = parseInt(String(req.params.promptId), 10);
            res.json(await collectionService.removeItem(parseParamId(req.params.id)!, req.userId!, promptId));
        } catch (e: any) { notFound(e); }
    });

    reorderItems = asyncHandler(async (req: AuthRequest, res: Response) => {
        try {
            const { order } = req.body;
            res.json(await collectionService.reorderItems(parseParamId(req.params.id)!, req.userId!, order));
        } catch (e: any) { notFound(e); }
    });

    getMembership = asyncHandler(async (req: AuthRequest, res: Response) => {
        const promptId = parseInt(String(req.params.promptId), 10);
        res.json(await collectionService.getItemMembership(promptId, req.userId!));
    });
}
