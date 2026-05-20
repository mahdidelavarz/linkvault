import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/Dashboard.service';
import { AuthRequest } from '../middleware/auth.middleware';


const dashboardService = new DashboardService();

export class DashboardController {
    async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            
            const [stats, recentItems] = await Promise.all([
                dashboardService.getStats(userId),
                dashboardService.getRecentItems(userId)
            ]);

            res.json({
                stats,
                recentItems
            });
        } catch (error) {
            next(error);
        }
    }
}