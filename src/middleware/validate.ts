import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

/**
 * Validates req.body against the given schema. On failure, responds
 * 400 with the zod issues. On success, replaces req.body with the
 * parsed (and possibly transformed/trimmed) data.
 */
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }

    req.body = parsed.data;
    next();
  };
}
