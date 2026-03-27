import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid request data", details: err.flatten() },
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
}
