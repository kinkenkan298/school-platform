import { StatusCodes } from "@school/types";

export class ApiError extends Error {
  public readonly statusCode: StatusCodes;
  public readonly isOperational: boolean;
  public readonly errors?: unknown;

  constructor(
    statusCode: StatusCodes,
    message: string,
    errors?: unknown,
    isOperational = true,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", errors?: unknown) {
    return new ApiError(StatusCodes.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(StatusCodes.UNAUTHORIZED, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(StatusCodes.FORBIDDEN, message);
  }

  static notFound(message = "Not Found") {
    return new ApiError(StatusCodes.NOT_FOUND, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(StatusCodes.CONFLICT, message);
  }

  static validation(message = "Validation failed", errors?: unknown) {
    return new ApiError(StatusCodes.BAD_REQUEST, message, errors);
  }

  static notImplemented(message = "Not Implemented") {
    return new ApiError(StatusCodes.NOT_IMPLEMENTED, message);
  }

  static badGateway(message = "Bad Gateway") {
    return new ApiError(StatusCodes.BAD_GATEWAY, message);
  }

  static serviceUnavailable(message = "Service Unavailable") {
    return new ApiError(StatusCodes.SERVICE_UNAVAILABLE, message);
  }

  static tooManyRequests(message = "Too Many Requests") {
    return new ApiError(StatusCodes.TOO_MANY_REQUESTS, message);
  }

  static server(message = "Internal Server Error") {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message);
  }
}
