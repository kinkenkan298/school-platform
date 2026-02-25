import { akunRouter } from "@/modules/akun/akun.routes";
import { healthRoutes } from "@/modules/health/health.routes";
import { periodeRouter } from "@/modules/periode/periode.routes";
import { Router } from "express";

const router: Router = Router();

router.use("/health", healthRoutes);
router.use("/akun", akunRouter);
router.use("/periode", periodeRouter);

export { router };
