import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/Auth.service';


const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }

            const result = await authService.register(username, password);
            
            res.status(201).json({
                message: 'User registered successfully',
                user: result.user,
                token: result.token
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Username already exists') {
                return res.status(409).json({ message: error.message });
            }
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            const result = await authService.login(username, password);
            
            res.json({
                message: 'Login successful',
                user: result.user,
                token: result.token
            });
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
}