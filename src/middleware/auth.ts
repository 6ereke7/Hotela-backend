import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getStaffById } from "../module/auth/auth.services.ts";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.staff_token;
  if (!token) {
    return res.status(401).json({
      success: false,
      data: "Token missing",
    });
  }

  try {
    const decoded: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "receptionist";
    } = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      name: string;
      role: "admin" | "receptionist";
    };
    const user = await getStaffById(decoded.id);
    if (!user?.isActive) {
      return res.status(401).json({
        success: false,
        error: "Staff account is inactive",
      });
    }
    if (user.role !== "admin" && user.role !== "receptionist") {
      return res
        .status(403)
        .json({ success: false, error: "Invalid staff role" });
    }
    req.user = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};
