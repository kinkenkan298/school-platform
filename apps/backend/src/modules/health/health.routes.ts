import {
  detailedHealthCheck,
  healthCheck,
} from "@/modules/health/health.controller";

import { Router } from "express";

const healthRoutes: Router = Router();

healthRoutes.get("/", healthCheck);
healthRoutes.get("/detailed", detailedHealthCheck);
export { healthRoutes };
