import { Response } from 'express';
import { ProjectService } from '../services/Project.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const projectService = new ProjectService();

export class ProjectController {
    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
        res.json(await projectService.findAll(req.userId!));
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        const project = await projectService.findOne(parseParamId(req.params.id)!, req.userId!);
        if (!project) throw new HttpError(404, 'Project not found');
        res.json({ project });
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        const project = await projectService.create(req.userId!, req.body);
        res.status(201).json({ project });
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        const project = await projectService.update(parseParamId(req.params.id)!, req.userId!, req.body);
        res.json({ project });
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        res.json(await projectService.delete(parseParamId(req.params.id)!, req.userId!));
    });

    addItem = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { itemType, itemId } = req.body;
        const item = await projectService.addItem(parseParamId(req.params.id)!, req.userId!, itemType, itemId);
        res.status(201).json({ item });
    });

    removeItem = asyncHandler(async (req: AuthRequest, res: Response) => {
        const itemType = String(req.params.itemType);
        const itemId   = parseInt(String(req.params.itemId), 10);
        res.json(await projectService.removeItem(parseParamId(req.params.id)!, req.userId!, itemType, itemId));
    });

    reorderItems = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { order } = req.body;
        res.json(await projectService.reorderItems(parseParamId(req.params.id)!, req.userId!, order));
    });

    getMembership = asyncHandler(async (req: AuthRequest, res: Response) => {
        const itemType = String(req.params.itemType);
        const itemId   = parseInt(String(req.params.itemId), 10);
        res.json(await projectService.getItemMembership(itemType, itemId, req.userId!));
    });
}
