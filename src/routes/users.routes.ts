import { Router } from "express";
import { getChannelProfile, getChannelVideos } from "../controllers/users.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const usersRouter = Router();

usersRouter.get("/:id", asyncHandler(getChannelProfile));
usersRouter.get("/:id/videos", asyncHandler(getChannelVideos));
