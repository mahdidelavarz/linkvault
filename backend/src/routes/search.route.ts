import { Router } from 'express';
import { SearchController } from '../controllers/Search.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const searchController = new SearchController();

router.use(authMiddleware);
router.get('/', searchController.search);

export default router;