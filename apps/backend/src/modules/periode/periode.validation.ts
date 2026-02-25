import { z } from "zod";

export const buatPeriodeSchema = z.object({
  tahun: z
    .number({ error: "Tahun wajib diisi!" })
    .int({ error: "Tahun wajib bilangan bulat!" })
    .min(2000, { error: "Tahun minimal 2000" })
    .max(2100, { error: "Tahun maximal 2100" }),
  bulan: z
    .number({ error: "Bulan wajib diisi!" })
    .int({ error: "Bulan wajib bilangan bulat!" })
    .min(1, { error: "Bulan minimal 1" })
    .max(12, { error: "Bulan maximal 12" }),
});

export type BuatPeriodeDTO = z.infer<typeof buatPeriodeSchema>;
