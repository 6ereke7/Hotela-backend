import type { NextFunction, Request, Response } from "express";
import * as service from "./rooms.service.ts";
import { rooms as roomTable } from "../../db/schema.ts";

type RoomRecord = typeof roomTable.$inferSelect;

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { price, ...roomData } = req.body;
    const newRoom = await service.createRoom({
      ...roomData,
      pricePerNight: String(price),
    });
    res.status(201).json({
      success: true,
      data: newRoom ? newRoom : null,
    });
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
    const rooms = await service.getRoom(
      (req.validated?.query as service.RoomFilter | undefined) ?? {},
    );
    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomInventory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rooms = await service.getRoom(
      (req.validated?.query as service.RoomFilter | undefined) ?? {},
      { includeUnavailable: true },
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
    const room = await service.getRoomById(
      (res.locals.validatedParams as { id: string }).id,
    );
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
    const { price, ...roomData } = req.body;
    const updatedRoom = await service.updateRoom(
      (res.locals.validatedParams as { id: string }).id,
      {
        ...roomData,
        ...(price === undefined ? {} : { pricePerNight: String(price) }),
      },
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
