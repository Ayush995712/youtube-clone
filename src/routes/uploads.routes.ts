import { Router } from "express";
import {
  getVideoPresignedUrl,
  getThumbnailPresignedUrl,
} from "../controllers/uploads.controller";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { presignedUrlSchema } from "../schemas/upload.schema";
import { asyncHandler } from "../middleware/asyncHandler";

export const uploadsRouter = Router();

uploadsRouter.post(
  "/video-presigned-url",
  requireAuth,
  validateBody(presignedUrlSchema),
  asyncHandler(getVideoPresignedUrl)
);

uploadsRouter.post(
  "/thumbnail-presigned-url",
  requireAuth,
  validateBody(presignedUrlSchema),
  asyncHandler(getThumbnailPresignedUrl)
);
