import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

type AsyncFn = (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFn) =>
    (req: AuthRequest, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}
