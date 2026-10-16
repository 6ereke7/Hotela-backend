import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: "admin" | "receptionist";
      };
    }
  }
}

export const roleMiddleware = (role: "admin" | "receptionist") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    if (role === "receptionist" && req.user.role !== "receptionist") {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    next();
  };
};
