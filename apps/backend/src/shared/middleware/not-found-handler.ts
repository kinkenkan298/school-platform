import { ApiError } from "@/shared/errors/api-error";
import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};
