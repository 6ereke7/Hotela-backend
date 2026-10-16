import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.ts";
import { roleMiddleware } from "../../middleware/role.ts";
import { validateMiddleware } from "../../middleware/validate.ts";
import * as controller from "./staff.controller.ts";
import {
  createReceptionistSchema,
  staffIdSchema,
  updateReceptionistSchema,
} from "./staff.schema.ts";

const staffRouter = Router();

staffRouter.use(authMiddleware, roleMiddleware("admin"));
staffRouter.get("/", controller.getReceptionists);
staffRouter.post(
  "/",
  validateMiddleware({ body: createReceptionistSchema }),
  controller.createReceptionist,
);
staffRouter.patch(
  "/:id",
  validateMiddleware({ params: staffIdSchema, body: updateReceptionistSchema }),
  controller.updateReceptionist,
);

export default staffRouter;
