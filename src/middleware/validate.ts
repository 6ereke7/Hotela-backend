import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { AnyZodObject } from "zod/v3";

interface ValidationSchemas {
    body?: AnyZodObject,
    query?: AnyZodObject,
    params?: AnyZodObject
}
 
export const validateMiddleware = (schemas: ValidationSchemas) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) req.body = await schemas.body.parseAsync(req.body);
            if (schemas.query) req.query = await schemas.query.parseAsync(req.query);
            if (schemas.params) req.params = await schemas.params.parseAsync(req.params);
        } catch (error){
            console.log(3)
            if(error instanceof ZodError){
                return res.status(400).json({
                    success:false,
                    error:'validation error',
                    details: error.issues
                })
            }
            next(error)
        }
        next()
    }
}