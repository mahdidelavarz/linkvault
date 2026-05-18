import { Router } from 'express';
import { SnippetController } from '../controllers/Snippet.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const snippetController = new SnippetController();

router.use(authMiddleware);

router.get('/', snippetController.findAll);
router.post('/', snippetController.create);
router.get('/:id', snippetController.findOne);
router.put('/:id', snippetController.update);
router.delete('/:id', snippetController.delete);
router.patch('/:id/favorite', snippetController.toggleFavorite);

export default router;