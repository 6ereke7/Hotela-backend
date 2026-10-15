import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            data: "Authorization header missing"
        });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            data: "Token missing"
        });
    }

    try {
        const decoded: { id: string; role: 'admin' | 'receptionist' } = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: 'admin' | 'receptionist' };
        req.user = decoded
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Invalid token"
        });
    }
};