import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Every request body is validated against a shared zod schema before it reaches any
 * handler — docs/build/07-SECURITY.md §2. A request that doesn't match is rejected
 * with 400 before touching the database or any business logic.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request', details: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
}
