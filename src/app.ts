import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "YouTube Clone API is running" });
});

app.use("/api", apiRouter);

// Must be last: 404 for unmatched routes, then the error handler.
app.use(notFoundHandler);
app.use(errorHandler);
