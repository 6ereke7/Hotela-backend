import type { NextFunction, Request, Response } from "express";
import * as service from "./rooms.service.ts";

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newRoom = await service.createRoom(req.body);
    res.status(201).json({ success: true, data: newRoom });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rooms = await service.getAllRooms(
      res.locals.validatedQuery as {
        checkIn?: string;
        checkOut?: string;
        type?: string;
        capacity?: number;
      },
    );
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = res.locals.validatedParams as { id: string };
    const room = await service.getRoomById(id);
    if (!room) {
      res.status(404).json({ success: false, error: "room not found" });
      return;
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedRoom = await service.updateRoom(
      (res.locals.validatedParams as { id: string }).id,
      req.body,
    );
    if (!updatedRoom) {
      res.status(404).json({ success: false, error: "room not found" });
      return;
    }
    res.status(200).json({ success: true, data: updatedRoom });
  } catch (error) {
    next(error);
  }
};

export const removeRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const removed = await service.removeRoom(
      (res.locals.validatedParams as { id: string }).id,
    );
    if (!removed) {
      res.status(404).json({ success: false, error: "room not found" });
      return;
    }
    res.status(200).json({ success: true, data: removed });
  } catch (error) {
    next(error);
  }
};
