import { Router } from 'express';
import { ProjectController } from '../controllers/Project.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema, addProjectItemSchema } from '../validation/schemas';

const router = Router();
const projectController = new ProjectController();

router.use(authMiddleware);

router.get('/', projectController.findAll);
router.post('/', validate(createProjectSchema), projectController.create);

// Membership route before /:id to avoid param collision
router.get('/membership/:itemType/:itemId', projectController.getMembership);

router.get('/:id', projectController.findOne);
router.put('/:id', validate(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.delete);

router.post('/:id/items', validate(addProjectItemSchema), projectController.addItem);
router.delete('/:id/items/:itemType/:itemId', projectController.removeItem);
router.put('/:id/items/reorder', projectController.reorderItems);

export default router;
