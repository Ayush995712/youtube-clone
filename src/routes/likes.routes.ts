import { Router } from "express";
import { likeVideo, unlikeVideo } from "../controllers/likes.controller";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { likeSchema } from "../schemas/like.schema";
import { asyncHandler } from "../middleware/asyncHandler";

export const likesRouter = Router();

likesRouter.post("/", requireAuth, validateBody(likeSchema), asyncHandler(likeVideo));
likesRouter.delete("/:uploadId", requireAuth, asyncHandler(unlikeVideo));
