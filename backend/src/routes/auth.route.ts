import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;