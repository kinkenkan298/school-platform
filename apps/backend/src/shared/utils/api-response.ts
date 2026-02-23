import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

type ApiResponseParams<T> = {
  success: boolean;
  message: string;
  statusCode: StatusCodes;
  data?: T | null;
  errors?: unknown;
};

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly statusCode: StatusCodes;
  public readonly data?: T | null;
  public readonly errors?: unknown;

  constructor({
    success,
    message,
    statusCode,
    data = null,
    errors,
  }: ApiResponseParams<T>) {
    this.success = success;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.errors = errors;
  }

  send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.data !== undefined && { data: this.data }),
      ...(this.errors !== undefined && { errors: this.errors }),
    });
  }

  static Success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: StatusCodes = StatusCodes.OK,
  ): Response {
    return new ApiResponse<T>({
      success: true,
      message,
      data,
      statusCode,
    }).send(res);
  }

  static ok<T>(res: Response, message = "OK", data?: T) {
    return ApiResponse.Success(res, message, data, StatusCodes.OK);
  }

  static created<T>(res: Response, message = "Created", data?: T) {
    return ApiResponse.Success(res, message, data, StatusCodes.CREATED);
  }
  static error<T>(res: Response, message = "Internal Server Error", data?: T) {
    return new ApiResponse<T>({
      success: false,
      message,
      data,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    }).send(res);
  }
}
