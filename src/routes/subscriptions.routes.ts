import { Router } from "express";
import { toggleSubscription } from "../controllers/subscriptions.controller";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { subscribeSchema } from "../schemas/subscription.schema";
import { asyncHandler } from "../middleware/asyncHandler";

export const subscriptionsRouter = Router();

subscriptionsRouter.post(
  "/toggle",
  requireAuth,
  validateBody(subscribeSchema),
  asyncHandler(toggleSubscription)
);
