import { NextFunction, Request, Response } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                role: 'admin' | 'receptionist';
            };
        }
    }
}

export const roleMiddleware = (role: 'admin' | 'receptionist') => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "User not authenticated"
            });
        }

        if (req.user.role === 'receptionist' && role === 'admin') {
            return res.status(403).json({
                success: false,
                error: "Insufficient permissions"
            });
        }

        next();
    };
};
