import { Router } from 'express';
import { CategoryController } from '../controllers/Category.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validation/schemas';

const router = Router();
const categoryController = new CategoryController();

router.use(authMiddleware);

router.get('/', categoryController.findAll);
router.get('/tree', categoryController.getTree);
router.post('/', validate(createCategorySchema), categoryController.create);
router.get('/:id', categoryController.findOne);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;
