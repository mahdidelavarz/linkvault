import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/Auth.service';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password, email } = req.body;
            const result = await authService.register(username, password, email);
            res.status(201).json({ message: 'User registered successfully', ...result });
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
            const result = await authService.login(username, password);
            res.json({ message: 'Login successful', ...result });
        } catch (error) {
            if (error instanceof Error && error.message === 'Invalid credentials') {
                return res.status(401).json({ message: error.message });
            }
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token is required' });
            }
            const result = await authService.refresh(refreshToken);
            res.json(result);
        } catch (error) {
            if (error instanceof Error && error.message === 'Invalid refresh token') {
                return res.status(401).json({ message: error.message });
            }
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                await authService.logout(refreshToken);
            }
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
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
            await authService.forgotPassword(email);
            res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password } = req.body;
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
