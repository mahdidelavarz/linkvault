import { Response, NextFunction } from 'express';
import { NoteService } from '../services/Note.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseParamId } from '../utils/parsParamId';


const noteService = new NoteService();

export class NoteController {
    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { search, categoryId, isPinned, tagIds } = req.query;

            const filters: any = {};
            if (search) filters.search = search as string;
            if (categoryId) filters.categoryId = parseInt(categoryId as string);
            if (isPinned) filters.isPinned = isPinned === 'true';
            if (tagIds) filters.tagIds = (tagIds as string).split(',').map(Number);

            const notes = await noteService.findAll(userId, filters);
            res.json({ notes });
        } catch (error) {
            next(error);
        }
    }

    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const note = await noteService.findOne(id, userId);
                if (!note) {
                    return res.status(404).json({ message: 'Note not found' });
                }

                res.json({ note });
            }

        } catch (error) {
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const note = await noteService.create(userId, req.body);
            res.status(201).json({ note });
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const note = await noteService.update(id, userId, req.body);
                res.json({ note });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Note not found') {
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
                const result = await noteService.delete(id, userId);
                res.json(result);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Note not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }

    async togglePin(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const id = parseParamId(req.params.id);
            if (id) {
                const note = await noteService.togglePin(id, userId);
                res.json({ note });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Note not found') {
                return res.status(404).json({ message: error.message });
            }
            next(error);
        }
    }
}