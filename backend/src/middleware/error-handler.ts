import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { HttpError } from "../utils/http-error.js";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    success: false,
    message: "API route not found.",
  });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const isUniqueConflict = error.code === "P2002";
    response.status(isUniqueConflict ? 409 : 400).json({
      success: false,
      message: isUniqueConflict
        ? "A record with that unique value already exists."
        : "The database could not complete this request.",
      code: error.code,
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};
