import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler<
  ReqBody = any,
  ResBody = any,
  ReqQuery = any,
  ReqParams = any,
> = (
  req: Request<ReqParams, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = <
  ReqBody = any,
  ResBody = any,
  ReqQuery = any,
  ReqParams = any,
>(
  fn: AsyncRequestHandler<ReqBody, ResBody, ReqQuery, ReqParams>,
): RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
