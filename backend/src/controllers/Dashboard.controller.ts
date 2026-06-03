import { Response } from 'express';
import { DashboardService } from '../services/Dashboard.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const dashboardService = new DashboardService();

export class DashboardController {
    getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
        const [stats, recentItems] = await Promise.all([
            dashboardService.getStats(req.userId!),
            dashboardService.getRecentItems(req.userId!),
        ]);
        res.json({ stats, recentItems });
    });
}
