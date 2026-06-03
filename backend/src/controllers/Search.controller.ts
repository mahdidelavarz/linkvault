import { Response } from 'express';
import { SearchService } from '../services/Search.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const searchService = new SearchService();

export class SearchController {
    search = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { q, categoryId, tagIds, type } = req.query;

        const options: any = {};
        if (q) options.query = q as string;
        if (categoryId) options.categoryId = parseInt(categoryId as string);
        if (type && ['link', 'note', 'snippet'].includes(type as string)) {
            options.type = type as string;
        }
        if (tagIds) {
            options.tagIds = (tagIds as string).split(',').map(Number).filter((id: number) => !isNaN(id));
        }

        const results = await searchService.globalSearch(req.userId!, options);
        const totalResults = results.links.length + results.notes.length + results.snippets.length;

        res.json({
            results,
            totalResults,
            query: q || '',
            filters: {
                categoryId: options.categoryId,
                tagIds: options.tagIds,
                type: options.type,
            },
        });
    });
}
