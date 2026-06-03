import { Router } from 'express';
import { NoteController } from '../controllers/Note.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createNoteSchema, updateNoteSchema } from '../validation/schemas';

const router = Router();
const noteController = new NoteController();

router.use(authMiddleware);

router.get('/', noteController.findAll);
router.post('/', validate(createNoteSchema), noteController.create);
router.get('/:id', noteController.findOne);
router.put('/:id', validate(updateNoteSchema), noteController.update);
router.delete('/:id', noteController.delete);
router.patch('/:id/pin', noteController.togglePin);

export default router;
