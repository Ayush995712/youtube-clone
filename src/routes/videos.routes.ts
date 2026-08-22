import { Router } from "express";
import {
  getAllVideos,
  getVideoById,
  incrementViewCount,
  createVideo,
  deleteVideo,
} from "../controllers/videos.controller";
import { getLikeInfo } from "../controllers/likes.controller";
import { getComments } from "../controllers/comments.controller";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { uploadSchema } from "../schemas/video.schema";
import { asyncHandler } from "../middleware/asyncHandler";
import { viewRateLimiter } from "../middleware/rateLimiters";

export const videosRouter = Router();

videosRouter.get("/", asyncHandler(getAllVideos));
videosRouter.get("/:id", optionalAuth, asyncHandler(getVideoById));
videosRouter.get("/:id/likes", optionalAuth, asyncHandler(getLikeInfo));
videosRouter.get("/:id/comments", asyncHandler(getComments));
videosRouter.post("/:id/view", viewRateLimiter, asyncHandler(incrementViewCount));
videosRouter.post("/", requireAuth, validateBody(uploadSchema), asyncHandler(createVideo));
videosRouter.delete("/:id", requireAuth, asyncHandler(deleteVideo));
