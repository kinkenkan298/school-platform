import { Router } from "express";
import {
  ambilDetailJurnal,
  ambilSemuaJurnal,
  batalkanJurnal,
  buatJurnal,
  hapusJurnal,
  postingJurnal,
  updateJurnal,
} from "./jurnal.controller";

const jurnalRouter: Router = Router();

jurnalRouter.get("/", ambilSemuaJurnal);
jurnalRouter.get("/:id", ambilDetailJurnal);
jurnalRouter.post("/", buatJurnal);
jurnalRouter.put("/:id", updateJurnal);
jurnalRouter.patch("/:id/posting", postingJurnal);
jurnalRouter.patch("/:id/batal", batalkanJurnal);
jurnalRouter.delete("/:id", hapusJurnal);

export { jurnalRouter };
