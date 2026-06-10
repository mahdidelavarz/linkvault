import { Router } from 'express';
import { PromptCollectionController } from '../controllers/PromptCollection.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createPromptCollectionSchema, updatePromptCollectionSchema, addPromptCollectionItemSchema } from '../validation/schemas';

const router = Router();
const collectionController = new PromptCollectionController();

router.use(authMiddleware);

router.get('/', collectionController.findAll);
router.post('/', validate(createPromptCollectionSchema), collectionController.create);

// Membership route before /:id to avoid param collision
router.get('/membership/:promptId', collectionController.getMembership);

router.get('/:id', collectionController.findOne);
router.put('/:id', validate(updatePromptCollectionSchema), collectionController.update);
router.delete('/:id', collectionController.delete);

router.post('/:id/items', validate(addPromptCollectionItemSchema), collectionController.addItem);
router.delete('/:id/items/:promptId', collectionController.removeItem);
router.put('/:id/items/reorder', collectionController.reorderItems);

export default router;
