import { akunRouter } from "@/modules/akun/akun.routes";
import { healthRoutes } from "@/modules/health/health.routes";
import { Router } from "express";

const router: Router = Router();

router.use("/health", healthRoutes);
router.use("/akun", akunRouter);

export { router };
