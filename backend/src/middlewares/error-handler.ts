import { ErrorRequestHandler, Response } from "express";
import { HTTP_STATUS } from "../core/utils/http-status-code";
import * as z from "zod";
import { AppError } from "../core/utils/app-error";

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors,
  });
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  console.error(`Error on PATH: ${req.path}`, error);

  if (error instanceof SyntaxError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid Json format, please check your request body",
    });
  }

  if (error instanceof z.ZodError) {
    formatZodError(res, error);
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknown error occurred",
  });
};
