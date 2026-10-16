import { Request, Response, Router } from "express";
import { login, logout } from "./auth.controller.ts";
import { validateMiddleware } from "../../middleware/validate.ts";
import { loginSchema } from "./auth.schemas.ts";
import { authMiddleware } from "../../middleware/auth.ts";

const authRouter: Router = Router();

authRouter.get("/me", authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
authRouter.post("/login", validateMiddleware({ body: loginSchema }), login);
authRouter.post("/logout", logout);

export default authRouter;
