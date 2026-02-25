import { Router } from "express";
import {
  ambilSemuaPeriode,
  ambilDetailPeriode,
  buatPeriode,
  tutupPeriode,
} from "./periode.controller";

const periodeRouter = Router();

periodeRouter.get("/", ambilSemuaPeriode);
periodeRouter.get("/:id", ambilDetailPeriode);
periodeRouter.post("/", buatPeriode);
periodeRouter.patch("/:id/tutup", tutupPeriode);

export { periodeRouter };
