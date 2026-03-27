export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string) {
    return new ApiError(400, msg, "BAD_REQUEST");
  }
  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg, "UNAUTHORIZED");
  }
  static forbidden(msg = "Forbidden") {
    return new ApiError(403, msg, "FORBIDDEN");
  }
  static notFound(msg = "Not found") {
    return new ApiError(404, msg, "NOT_FOUND");
  }
  static tooManyRequests(msg = "Too many requests") {
    return new ApiError(429, msg, "RATE_LIMITED");
  }
  static internal(msg = "Internal server error") {
    return new ApiError(500, msg, "INTERNAL_ERROR");
  }
}
