import type { NextFunction, Request, Response } from "express";
import { resetDatabase as resetDatabaseService } from "./database.service.ts";

export const resetDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await resetDatabaseService();

    console.warn(
      [
        "Development database reset completed.",
        `Manager email: ${result.manager.email}`,
        `Manager password: ${result.manager.password}`,
        "Store this password securely; it will not be shown again.",
      ].join("\n"),
    );

    res.status(200).json({
      success: true,
      data: {
        managerEmail: result.manager.email,
        roomsCreated: result.roomsCreated,
        bookingsCreated: result.bookingsCreated,
        otpRecordsCreated: result.otpRecordsCreated,
      },
    });
  } catch (error) {
    next(error);
  }
};
