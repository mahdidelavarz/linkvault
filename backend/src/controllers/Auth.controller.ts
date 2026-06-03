import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/Auth.service';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password, email } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }

            const result = await authService.register(username, password, email);
            res.status(201).json({ message: 'User registered successfully', user: result.user, token: result.token });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Username already exists' || error.message === 'Email already in use') {
                    return res.status(409).json({ message: error.message });
                }
            }
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            const result = await authService.login(username, password);
            res.json({ message: 'Login successful', user: result.user, token: result.token });
        } catch (error) {
            if (error instanceof Error && error.message === 'Invalid credentials') {
                return res.status(401).json({ message: error.message });
            }
            next(error);
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).userId;
            const user = await authService.getCurrentUser(userId);
            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            await authService.forgotPassword(email);
            // Always return 200 to prevent email enumeration
            res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({ message: 'Token and new password are required' });
            }
            if (password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters' });
            }
            await authService.resetPassword(token, password);
            res.json({ message: 'Password has been reset successfully' });
        } catch (error) {
            if (error instanceof Error && error.message === 'Invalid or expired reset link') {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
}
