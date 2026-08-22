import "express";

declare global {
  namespace Express {
    interface Request {
      /** Populated by requireAuth / optionalAuth middleware */
      userId?: string;
    }
  }
}

export {};
