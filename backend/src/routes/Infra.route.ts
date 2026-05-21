import { Router } from 'express';
import { InfraController } from '../controllers/Infra.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const infraController = new InfraController();

router.use(authMiddleware);

router.get('/', infraController.findAll);
router.post('/', infraController.create);
router.get('/:id', infraController.findOne);
router.put('/:id', infraController.update);
router.delete('/:id', infraController.delete);
router.patch('/:id/favorite', infraController.toggleFavorite);

export default router;