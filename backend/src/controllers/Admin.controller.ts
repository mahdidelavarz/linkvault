import { Response } from 'express';
import { AdminService } from '../services/Admin.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const adminService = new AdminService();

export class AdminController {
    getOverview = asyncHandler(async (_req: AuthRequest, res: Response) => {
        const overview = await adminService.getOverview();
        res.json(overview);
    });
}
