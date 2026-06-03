import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/Auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const passwordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'Too many password reset requests. Please try again in an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router();
const authController = new AuthController();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/forgot-password', passwordLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
