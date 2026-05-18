import { Router } from 'express';
import { NoteController } from '../controllers/Note.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const noteController = new NoteController();

router.use(authMiddleware);

router.get('/', noteController.findAll);
router.post('/', noteController.create);
router.get('/:id', noteController.findOne);
router.put('/:id', noteController.update);
router.delete('/:id', noteController.delete);
router.patch('/:id/pin', noteController.togglePin);

export default router;