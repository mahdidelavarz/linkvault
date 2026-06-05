import { Response } from 'express';
import { SearchService } from '../services/Search.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const searchService = new SearchService();

const VALID_TYPES = new Set(['link', 'note', 'snippet', 'prompt', 'infrastructure']);

export class SearchController {
    search = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { q, categoryId, tagIds, type } = req.query;

        const options: any = {};
        if (q) options.query = q as string;
        if (categoryId) options.categoryId = parseInt(categoryId as string);
        if (type && VALID_TYPES.has(type as string)) {
            options.type = type as string;
        }
        if (tagIds) {
            options.tagIds = (tagIds as string).split(',').map(Number).filter((id: number) => !isNaN(id));
        }

        const { totals, ...groups } = await searchService.globalSearch(req.userId!, options);

        res.json({
            results: groups,
            totals,
            totalResults: totals.links + totals.notes + totals.snippets + totals.prompts + totals.infrastructures,
            query: q || '',
            filters: {
                categoryId: options.categoryId,
                tagIds: options.tagIds,
                type: options.type,
            },
        });
    });
}
