import { Router } from 'express';
import { CategoryController } from '../controllers/Category.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const categoryController = new CategoryController();

router.use(authMiddleware);

router.get('/', categoryController.findAll);
router.get('/tree', categoryController.getTree);
router.post('/', categoryController.create);
router.get('/:id', categoryController.findOne);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;