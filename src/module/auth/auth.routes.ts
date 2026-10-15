import { Router } from "express"
import { login } from "./auth.controller.ts";
import { validateMiddleware } from "../../middleware/validate.ts";
import { loginSchema } from "./auth.schemas.ts";

const authRouter: Router = Router()

authRouter.post(
    '/',
    validateMiddleware({ body: loginSchema as any }),
    login)

export default authRouter;