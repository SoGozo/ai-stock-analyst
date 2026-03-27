import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import stockRoutes from "./routes/stock.routes";
import watchlistRoutes from "./routes/watchlist.routes";
import mlRoutes from "./routes/ml.routes";

export function createApp() {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS.split(","),
      credentials: true,
    })
  );
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Parsing
  app.use(express.json());
  app.use(cookieParser());

  // Logging
  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "backend", timestamp: new Date().toISOString() });
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/stocks", stockRoutes);
  app.use("/api/watchlist", watchlistRoutes);
  app.use("/api/ml", mlRoutes);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
