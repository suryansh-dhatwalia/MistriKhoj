import { randomUUID } from "node:crypto";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { mistriRouter } from "./routes/mistri.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { contentRouter } from "./routes/content.routes.js";
import { advertiseRouter } from "./routes/advertise.routes.js";
import { prisma } from "./lib/prisma.js";
import { HttpError } from "./utils/http-error.js";

export const app = express();

app.disable("x-powered-by");
if (env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(helmet());
app.use((request, response, next) => {
  const incomingRequestId = request.get("x-request-id")?.trim().slice(0, 100);
  const requestId = incomingRequestId || randomUUID();
  const startedAt = Date.now();

  response.locals.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  response.on("finish", () => {
    if (env.NODE_ENV !== "test") {
      console.log(
        JSON.stringify({
          requestId,
          method: request.method,
          path: request.path,
          status: response.statusCode,
          durationMs: Date.now() - startedAt,
        }),
      );
    }
  });
  next();
});
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
      callback(new HttpError(403, "Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);
app.use(cookieParser());

// Keep ordinary JSON requests small. Larger parsers are scoped only to the
// endpoints that accept base64 image/video uploads.
app.use("/api/mistris/register", express.json({ limit: "35mb" }));
app.use("/api/advertise", express.json({ limit: "75mb" }));
app.use("/api/admin/advertisements", express.json({ limit: "75mb" }));
app.use("/api/admin/testimonials", express.json({ limit: "10mb" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "MistriKhoj API is running.",
  });
});

app.get("/api/ready", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.status(200).json({ success: true, message: "MistriKhoj API is ready." });
  } catch {
    response.status(503).json({
      success: false,
      message: "MistriKhoj API is not ready.",
    });
  }
});

app.use("/api/mistris", mistriRouter);
app.use("/api/content", contentRouter);
app.use("/api/advertise", advertiseRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
