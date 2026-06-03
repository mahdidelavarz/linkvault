import { Response } from 'express';
import { NoteService } from '../services/Note.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, HttpError } from '../middleware/asyncHandler';
import { parseParamId } from '../utils/parsParamId';

const noteService = new NoteService();

export class NoteController {
    findAll = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { search, categoryId, isPinned, tagIds, page, limit } = req.query;

        const filters: any = {};
        if (search) filters.search = search as string;
        if (categoryId) filters.categoryId = parseInt(categoryId as string);
        if (isPinned) filters.isPinned = isPinned === 'true';
        if (tagIds) filters.tagIds = (tagIds as string).split(',').map(Number);

        const pagination = {
            page: parseInt(page as string) || 1,
            limit: Math.min(parseInt(limit as string) || 20, 100),
        };

        res.json(await noteService.findAll(userId, filters, pagination));
    });

    findOne = asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseParamId(req.params.id)!;
        const note = await noteService.findOne(id, req.userId!);
        if (!note) throw new HttpError(404, 'Note not found');
        res.json({ note });
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        const note = await noteService.create(req.userId!, req.body);
        res.status(201).json({ note });
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseParamId(req.params.id)!;
        try {
            const note = await noteService.update(id, req.userId!, req.body);
            res.json({ note });
        } catch (e: any) {
            throw e.message === 'Note not found' ? new HttpError(404, e.message) : e;
        }
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseParamId(req.params.id)!;
        try {
            res.json(await noteService.delete(id, req.userId!));
        } catch (e: any) {
            throw e.message === 'Note not found' ? new HttpError(404, e.message) : e;
        }
    });

    togglePin = asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseParamId(req.params.id)!;
        try {
            const note = await noteService.togglePin(id, req.userId!);
            res.json({ note });
        } catch (e: any) {
            throw e.message === 'Note not found' ? new HttpError(404, e.message) : e;
        }
    });
}
