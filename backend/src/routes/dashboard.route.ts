import { Router } from 'express';
import { DashboardController } from '../controllers/Dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const dashboardController = new DashboardController();

router.use(authMiddleware);
router.get('/', dashboardController.getDashboard);

export default router;