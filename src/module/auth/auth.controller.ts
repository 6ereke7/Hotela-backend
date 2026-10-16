import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getStaffByEmail } from "./auth.services.ts";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await getStaffByEmail(req.body.email);
  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      data: "invalid email",
    });
    return;
  }
  const hashedPass = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!hashedPass) {
    res.status(401).json({
      success: false,
      data: "invalid password",
    });
    return;
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" },
  );
  res.cookie("staff_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
    },
  });
};
export const logout = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("staff_token", {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({
    success: true,
    data: "logged out successfully",
  });
};
