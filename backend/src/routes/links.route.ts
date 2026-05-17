import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { LinkController } from '../controllers/Links.controller';


const router = Router();
const linkController = new LinkController();

// All routes require authentication
router.use(authMiddleware);

router.get('/', linkController.findAll);
router.post('/', linkController.create);
router.get('/:id', linkController.findOne);
router.put('/:id', linkController.update);
router.delete('/:id', linkController.delete);
router.patch('/:id/favorite', linkController.toggleFavorite);

export default router;