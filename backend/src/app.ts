import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { mistriRouter } from "./routes/mistri.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

export const app = express();

app.disable("x-powered-by");
if (env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again shortly." },
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = new Set([env.FRONTEND_URL, env.ADMIN_URL]);
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "MistriKhoj API is running.",
  });
});

app.use("/api/mistris", mistriRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
