import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { PromptController } from '../controllers/Prompt.controller';


const router = Router();
const promptController = new PromptController();

router.use(authMiddleware);

router.get('/', promptController.findAll);
router.post('/', promptController.create);
router.get('/:id', promptController.findOne);
router.put('/:id', promptController.update);
router.delete('/:id', promptController.delete);
router.patch('/:id/favorite', promptController.toggleFavorite);
router.patch('/:id/use', promptController.incrementUsage);

export default router;