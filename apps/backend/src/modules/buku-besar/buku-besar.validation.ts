import { z } from "zod";

export const queryBukuBesarSchema = z
  .object({
    akunId: z.uuid({ error: "Format Akun ID tidak valid" }),
    dari: z.iso.date({
      error: "Format tanggal tidak valid, gunakan format (YYYY-MM-DD)",
    }),
    sampai: z.iso.date({
      error: "Format tanggal tidak valid, gunakan format (YYYY-MM-DD)",
    }),
  })
  .refine((data) => data.dari <= data.sampai, {
    message:
      "Tanggal 'dari' harus lebih kecil atau sama dengan tanggal 'sampai'",
  });
export type QueryBukuBesarDTO = z.infer<typeof queryBukuBesarSchema>;
