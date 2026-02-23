import { healthRoutes } from "@/modules/health/health.routes";
import { Router } from "express";

const router: Router = Router();

router.use("/health", healthRoutes);

export { router };
