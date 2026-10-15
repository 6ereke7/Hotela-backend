import { Router } from "express";
import * as controller from "./rooms.controller.ts";
import { validateMiddleware } from "../../middleware/validate.ts";
import { createRoomSchema} from "./rooms.schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { roleMiddleware } from "../../middleware/role.ts";

const roomsRouter: Router = Router();

roomsRouter.post(
    '/',
    authMiddleware,
    roleMiddleware('admin'),
    validateMiddleware({ body: createRoomSchema as any }),
    controller.createRoom
);
roomsRouter.get(
    '/',
    controller.getRooms
);

roomsRouter.patch(
    '/',
    authMiddleware,
    roleMiddleware('admin'),
    controller.removeRoom
)
  
export default roomsRouter;