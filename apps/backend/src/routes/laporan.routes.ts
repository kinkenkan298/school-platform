import { arusKas } from "@/modules/arus-kas/arus-kas.controller";
import { labaRugi } from "@/modules/laba-rugi/laba-rugi.controller";
import { neraca } from "@/modules/neraca/neraca.controller";
import { Router } from "express";
import { bukuBesar } from "../modules/buku-besar/buku-besar.controller";

const laporanRouter: Router = Router();

laporanRouter.get("/buku-besar", bukuBesar);
laporanRouter.get("/laba-rugi", labaRugi);
laporanRouter.get("/neraca", neraca);
laporanRouter.get("/arus-kas", arusKas);

export { laporanRouter };
