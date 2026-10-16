import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as service from "./staff.service.ts";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function getReceptionists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res
      .status(200)
      .json({ success: true, data: await service.getReceptionists() });
  } catch (error) {
    next(error);
  }
}

export async function createReceptionist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { password, ...profile } = req.body;
    const receptionist = await service.createReceptionist({
      ...profile,
      passwordHash: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ success: true, data: receptionist });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res
        .status(409)
        .json({
          success: false,
          error: "Email or phone number is already in use",
        });
      return;
    }
    next(error);
  }
}

export async function updateReceptionist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { password, ...profile } = req.body;
    const receptionist = await service.updateReceptionist(
      (res.locals.validatedParams as { id: string }).id,
      {
        ...profile,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
    );
    if (!receptionist) {
      res.status(404).json({ success: false, error: "Receptionist not found" });
      return;
    }
    res.status(200).json({ success: true, data: receptionist });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res
        .status(409)
        .json({
          success: false,
          error: "Email or phone number is already in use",
        });
      return;
    }
    next(error);
  }
}
