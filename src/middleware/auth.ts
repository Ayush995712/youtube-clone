import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

function extractUserId(req: Request): string | null {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

/**
 * Use on protected routes. Sends 401 and stops the request if
 * there's no valid token. Otherwise sets req.userId and continues.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = extractUserId(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.userId = userId;
  next();
}

/**
 * Use on public routes that behave differently for a logged-in
 * viewer (e.g. "did I like this video"). Never blocks the request.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = extractUserId(req);

  if (userId) {
    req.userId = userId;
  }

  next();
}
