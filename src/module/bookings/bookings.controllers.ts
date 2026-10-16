import type { Request, Response, NextFunction } from "express";
import * as service from "./bookings.services.ts";
import type { bookings } from "../../db/schema.ts";

export const requestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await service.requestBookingOtp(req.body.email);
    res.status(200).json({
      success: true,
      data: { expiresAt: result.expiresAt },
      ...(process.env.NODE_ENV !== "production"
        ? { devCode: result.code }
        : {}),
    });
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { booking, otp, quotedTotal } = req.body;
    const result = await service.confirmBooking(
      booking.email,
      otp,
      booking as Omit<
        typeof bookings.$inferInsert,
        "id" | "createdAt" | "status" | "totalAmount"
      >,
      quotedTotal,
    );
    if (result.kind === "invalid") {
      res.status(400).json({
        success: false,
        error: "invalid or expired verification code",
      });
      return;
    }
    if (result.kind === "price_changed") {
      res.status(409).json({
        success: false,
        error: "PRICE_CHANGED",
        data: {
          nightlyRate: result.nightlyRate,
          totalAmount: result.totalAmount,
        },
      });
      return;
    }
    res.status(201).json({ success: true, data: result.booking });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newBooking = await service.createBooking(req.body);
    res.status(201).json({
      success: true,
      data: newBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await service.getAllBookings();
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedBooking = await service.updateBooking(
      (res.locals.validatedParams as { id: string }).id,
      req.body.status,
    );
    if (!updatedBooking) {
      res.status(404).json({ success: false, error: "booking not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deletedBooking = await service.deleteBooking(
      (res.locals.validatedParams as { id: string }).id,
    );
    if (!deletedBooking) {
      res.status(404).json({ success: false, error: "booking not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: deletedBooking,
    });
  } catch (error) {
    next(error);
  }
};
