import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);

    const status: number = err.status || err.statusCode || 500;
    const message: string = err.message || 'Internal server error';

    if (status >= 500) console.error('Error:', err);

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === 'development' && status >= 500 && { stack: err.stack }),
    });
};
