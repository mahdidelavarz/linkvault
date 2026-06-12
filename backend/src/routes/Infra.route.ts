import { Router } from 'express';
import { InfraController } from '../controllers/Infra.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createInfraSchema, updateInfraSchema } from '../validation/schemas';

const router = Router();
const infraController = new InfraController();

router.use(authMiddleware);

router.get('/', infraController.findAll);
router.post('/', validate(createInfraSchema), infraController.create);
router.get('/:id', infraController.findOne);
router.put('/:id', validate(updateInfraSchema), infraController.update);
router.delete('/:id', infraController.delete);
router.patch('/:id/favorite', infraController.toggleFavorite);

export default router;
