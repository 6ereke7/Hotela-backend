import { Router } from "express";
import * as controller from "./rooms.controller.ts";
import { validateMiddleware } from "../../middleware/validate.ts";
import {
  createRoomSchema,
  getRoomByIdSchema,
  getRoomsQuerySchema,
  updateRoomSchema,
} from "./rooms.schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { roleMiddleware } from "../../middleware/role.ts";

const roomsRouter: Router = Router();

roomsRouter.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validateMiddleware({ body: createRoomSchema }),
  controller.createRoom,
);
roomsRouter.get(
  "/",
  validateMiddleware({ query: getRoomsQuerySchema }),
  controller.getRooms,
);
roomsRouter.get(
  "/:id",
  validateMiddleware({ params: getRoomByIdSchema }),
  controller.getRoomById,
);
roomsRouter.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMiddleware({ params: getRoomByIdSchema, body: updateRoomSchema }),
  controller.updateRoom,
);
roomsRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMiddleware({ params: getRoomByIdSchema }),
  controller.removeRoom,
);

export default roomsRouter;
