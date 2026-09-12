import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { HttpError } from "../utils/http-error.js";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    success: false,
    message: "API route not found.",
    requestId: response.locals.requestId,
  });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const requestId = response.locals.requestId as string | undefined;
  const requestError = error as Error & { status?: number; type?: string };

  if (requestError.type === "entity.too.large") {
    response.status(413).json({
      success: false,
      message: "The uploaded request is too large.",
      requestId,
    });
    return;
  }

  if (requestError instanceof SyntaxError && requestError.status === 400) {
    response.status(400).json({
      success: false,
      message: "The request body contains invalid JSON.",
      requestId,
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      requestId,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const isUniqueConflict = error.code === "P2002";
    const isDatabaseUnavailable = new Set([
      "P1000",
      "P1001",
      "P1002",
      "P1003",
      "P1008",
      "P1017",
      "P2024",
      "P2039",
    ]).has(error.code);

    if (isDatabaseUnavailable) {
      console.error("Database unavailable", { requestId, code: error.code });
    }

    response.status(isUniqueConflict ? 409 : isDatabaseUnavailable ? 503 : 400).json({
      success: false,
      message: isUniqueConflict
        ? "A record with that unique value already exists."
        : isDatabaseUnavailable
          ? "The database is temporarily unavailable."
        : "The database could not complete this request.",
      code: error.code,
      requestId,
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
    requestId,
  });
};
