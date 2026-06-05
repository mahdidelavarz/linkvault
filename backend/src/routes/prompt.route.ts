import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { PromptController } from '../controllers/Prompt.controller';
import { validate } from '../middleware/validate';
import { createPromptSchema, updatePromptSchema } from '../validation/schemas';

const router = Router();
const promptController = new PromptController();

router.use(authMiddleware);

router.get('/', promptController.findAll);
router.post('/', validate(createPromptSchema), promptController.create);
router.get('/:id', promptController.findOne);
router.put('/:id', validate(updatePromptSchema), promptController.update);
router.delete('/:id', promptController.delete);
router.patch('/:id/favorite', promptController.toggleFavorite);
router.patch('/:id/use', promptController.incrementUsage);
router.get('/:id/versions', promptController.getVersions);

export default router;
