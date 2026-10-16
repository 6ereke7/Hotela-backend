import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validateMiddleware = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = await schemas.body.parseAsync(req.body);
      if (schemas.query)
        res.locals.validatedQuery = await schemas.query.parseAsync(req.query);
      if (schemas.params)
        res.locals.validatedParams = await schemas.params.parseAsync(
          req.params,
        );
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "validation error",
          details: error.issues,
        });
      }
      return next(error);
    }
    next();
  };
};
