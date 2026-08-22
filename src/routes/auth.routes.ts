import { Router } from "express";
import { signup, signin } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { signupSchema, signinSchema } from "../schemas/auth.schema";
import { asyncHandler } from "../middleware/asyncHandler";
import { authRateLimiter } from "../middleware/rateLimiters";

export const authRouter = Router();

authRouter.post(
  "/signup",
  authRateLimiter,
  validateBody(signupSchema),
  asyncHandler(signup)
);

authRouter.post(
  "/signin",
  authRateLimiter,
  validateBody(signinSchema),
  asyncHandler(signin)
);
