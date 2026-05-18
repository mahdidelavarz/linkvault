import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { TagController } from '../controllers/Tag.controller';


const router = Router();
const tagController = new TagController();

router.use(authMiddleware);

router.get('/', tagController.findAll);
router.post('/', tagController.create);
router.get('/:id', tagController.findOne);
router.put('/:id', tagController.update);
router.delete('/:id', tagController.delete);

export default router;