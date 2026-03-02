import { Router } from "express";
import {
  ambilDetailAkun,
  ambilSemuaAkun,
  buatAkun,
  hapusAkun,
  updateAkun,
} from "./akun.controller";

const akunRouter: Router = Router();

akunRouter.get("/", ambilSemuaAkun);
akunRouter.get("/:id", ambilDetailAkun);
akunRouter.post("/", buatAkun);
akunRouter.put("/:id", updateAkun);
akunRouter.delete("/:id", hapusAkun);

export { akunRouter };
