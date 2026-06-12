import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export interface AuthRequest extends Request {
    userId?: number;
    username?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Token error' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ message: 'Token malformatted' });
        }

        jwt.verify(token, jwtConfig.secret, (err, decoded: any) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            req.userId = decoded.userId;
            req.username = decoded.username;

            return next();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};