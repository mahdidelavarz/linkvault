import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { LinkController } from '../controllers/Links.controller';
import { validate } from '../middleware/validate';
import { createLinkSchema, updateLinkSchema } from '../validation/schemas';

const router = Router();
const linkController = new LinkController();

router.use(authMiddleware);

router.get('/', linkController.findAll);
router.get('/meta', linkController.fetchMeta);
router.post('/', validate(createLinkSchema), linkController.create);
router.get('/:id', linkController.findOne);
router.put('/:id', validate(updateLinkSchema), linkController.update);
router.delete('/:id', linkController.delete);
router.patch('/:id/favorite', linkController.toggleFavorite);

export default router;
