import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import pino, { type Logger } from "pino";
import { pinoHttp } from "pino-http";
import { StatusCodes } from "@school/types";

const logger: Logger = pino({
  name: "backend",
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
      ignore: "pid,hostname",
      singleLine: true,
    },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
      };
    },
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        "user-agent": req.headers["user-agent"],
        "content-type": req.headers["content-type"],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  const existingId = req.headers["x-request-id"] as string;
  const requestId = existingId || randomUUID();

  // Set for downstream use
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
};
const getLogLevel = (status: number) => {
  if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return "error";
  if (status >= StatusCodes.BAD_REQUEST) return "warn";
  return "info";
};
const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-request-id"] as string,
  customLogLevel: (_req, res) => getLogLevel(res.statusCode),
  customSuccessMessage: (req) => `${req.method} ${req.url} completed`,
  customErrorMessage: (_req, res) =>
    `Request failed with status code: ${res.statusCode}`,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
    }),
  },
});

const dbLogger = {
  info: (message: string, data?: any) => {
    logger.info({ ...data, context: "DATABASE" }, message);
  },
  error: (message: string, data?: any) => {
    logger.error({ ...data, context: "DATABASE" }, message);
  },
  warn: (message: string, data?: any) => {
    logger.warn({ ...data, context: "DATABASE" }, message);
  },
};

const logBodyRequests = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "development") {
    if (req.body && Object.keys(req.body).length > 0) {
      logger.debug(
        {
          body: req.body,
        },
        "Body parameters",
      );
    }
  }
  next();
};

const logQueryParams = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "development") {
    if (Object.keys(req.query).length > 0) {
      logger.debug(
        {
          query: req.query,
        },
        "Query parameters",
      );
    }
  }
  next();
};

export {
  dbLogger,
  logBodyRequests,
  logger,
  logQueryParams,
  httpLogger,
  addRequestId,
};
