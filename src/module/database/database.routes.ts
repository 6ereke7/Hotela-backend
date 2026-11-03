import { Router } from "express";
import * as controller from "./database.controller.ts";

export const databaseRouter = Router();

databaseRouter.get("/", controller.resetDatabase);
