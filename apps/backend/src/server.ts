import cors from "cors";
import express, { Express } from "express";
import { errorHandler } from "@/shared/middleware/error-handler";
import {
  httpLogger,
  logBodyRequests,
  logQueryParams,
  addRequestId,
} from "@/shared/utils/logger";
import helmet from "helmet";
import { notFoundHandler } from "@/shared/middleware/not-found-handler";
import { router } from "@/routes";
import env from "./shared/config/env";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(helmet());

app.use([httpLogger, addRequestId, logBodyRequests, logQueryParams]);

// routes

app.get("/", (req, res) => {
  res.redirect("/v1/api/health");
});

app.use("/v1/api", router);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
