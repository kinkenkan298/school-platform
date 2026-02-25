import { akunRouter } from "@/modules/akun/akun.routes";
import { healthRoutes } from "@/modules/health/health.routes";
import { jurnalRouter } from "@/modules/jurnal/jurnal.routes";
import { periodeRouter } from "@/modules/periode/periode.routes";
import { laporanRouter } from "@/routes/laporan.routes";
import { Router } from "express";

const router: Router = Router();

router.use("/health", healthRoutes);
router.use("/akun", akunRouter);
router.use("/periode", periodeRouter);
router.use("/jurnal", jurnalRouter);
router.use("/laporan", laporanRouter);

export { router };
