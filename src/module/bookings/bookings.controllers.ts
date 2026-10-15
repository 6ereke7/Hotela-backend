import type { Request, Response, NextFunction } from "express";
import * as service from "./bookings.services.ts";
import { bookings } from "../../db/schema.ts";

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newBooking = await service.createBooking(req.body);
        res.status(201).json({
            success: true,
            data: newBooking
        });
    } catch (error) {
        next(error);
    }
};


export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookings = await service.getAllBookings();
        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedBooking = await service.updateBooking(req.body.phoneNumber, req.body);
        res.status(200).json({
            success: true,
            data: updatedBooking
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedBooking = await service.deleteBooking(req.body.phoneNumber);
        res.status(200).json({
            success: true,
            data: deletedBooking
        });
    } catch (error) {
        next(error);
    }
};