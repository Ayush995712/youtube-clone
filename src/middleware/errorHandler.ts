import { Request, Response, NextFunction } from "express";

interface PrismaLikeError {
  code?: string;
  meta?: { target?: string[] };
}

/**
 * Central place that turns known error shapes (Prisma error codes)
 * into sensible HTTP responses, and logs + 500s anything else.
 * Must be registered LAST, after all routes.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  const error = err as PrismaLikeError;

  // Unique constraint violation
  if (error.code === "P2002") {
    res.status(409).json({
      error: `${error.meta?.target?.join(", ") || "Resource"} already exists`,
    });
    return;
  }

  // Record not found (e.g. update/delete on missing row)
  if (error.code === "P2025") {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  console.error(`Unhandled error on ${req.method} ${req.path}:`, err);

  res.status(500).json({ error: "Internal server error" });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
}
