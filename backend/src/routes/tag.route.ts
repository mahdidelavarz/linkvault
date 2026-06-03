import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { TagController } from '../controllers/Tag.controller';
import { validate } from '../middleware/validate';
import { createTagSchema, updateTagSchema } from '../validation/schemas';

const router = Router();
const tagController = new TagController();

router.use(authMiddleware);

router.get('/', tagController.findAll);
router.post('/', validate(createTagSchema), tagController.create);
router.get('/:id', tagController.findOne);
router.put('/:id', validate(updateTagSchema), tagController.update);
router.delete('/:id', tagController.delete);

export default router;
