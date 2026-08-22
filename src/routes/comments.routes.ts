import { Router } from "express";
import { createComment, deleteComment } from "../controllers/comments.controller";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { commentSchema } from "../schemas/comment.schema";
import { asyncHandler } from "../middleware/asyncHandler";

export const commentsRouter = Router();

commentsRouter.post("/", requireAuth, validateBody(commentSchema), asyncHandler(createComment));
commentsRouter.delete("/:commentId", requireAuth, asyncHandler(deleteComment));
