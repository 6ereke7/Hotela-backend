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
      const validated: NonNullable<Request["validated"]> = {};

      if (schemas.body) {
        validated.body = await schemas.body.parseAsync(req.body);
        req.body = validated.body;
      }
      if (schemas.query)
        validated.query = await schemas.query.parseAsync(req.query);
      if (schemas.params) {
        validated.params = await schemas.params.parseAsync(req.params);
        res.locals.validatedParams = validated.params;
      }

      req.validated = validated;
      if (validated.query) {
        res.locals.validatedQuery = validated.query;
      }
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
