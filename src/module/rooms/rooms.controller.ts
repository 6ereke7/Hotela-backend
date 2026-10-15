import type { NextFunction, Request, Response } from "express";
import * as service from "./rooms.service.ts";

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
    const newRoom = await service.createRoom(req.body)
    res.status(201).json({
        success: true,
        data: newRoom
    })
}

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
    const rooms = await service.getAllRooms()
    if (rooms === undefined || rooms === null) {
        return res.status(404).json({
            success: false,
            error: 'rooms not found'
        })
    }
    res.status(200).json({
        success: true,
        data: rooms
    })
}

export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    const updatedRoom = await service.updateRoom(req.body.id, req.body)
    res.status(201).json({
        success: true,
        data: updatedRoom
    })
}

export const removeRoom = async (req: Request, res: Response, next: NextFunction) => {
    const removed = await service.removeRoom(req.body.id)
    res.status(201).json({
        success: true,
        data: removed
    })
}
