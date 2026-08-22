import { Router } from "express";
import { authRouter } from "./auth.routes";
import { videosRouter } from "./videos.routes";
import { uploadsRouter } from "./uploads.routes";
import { likesRouter } from "./likes.routes";
import { subscriptionsRouter } from "./subscriptions.routes";
import { commentsRouter } from "./comments.routes";
import { usersRouter } from "./users.routes";

export const apiRouter = Router();

apiRouter.use("/", authRouter); // /api/signup, /api/signin
apiRouter.use("/videos", videosRouter); // /api/videos/*
apiRouter.use("/uploads", uploadsRouter); // /api/uploads/*
apiRouter.use("/likes", likesRouter); // /api/likes/*
apiRouter.use("/subscribers", subscriptionsRouter); // /api/subscribers/*
apiRouter.use("/comment", commentsRouter); // /api/comment/*
apiRouter.use("/users", usersRouter); // /api/users/*
