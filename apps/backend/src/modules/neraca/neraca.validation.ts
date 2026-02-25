import { z } from "zod";

export const queryNeracaSchema = z.object({
  sampai: z.iso.date("Format tanggal tidak valid, gunakan YYYY-MM-DD"),
});

export type QueryNeracaDTO = z.infer<typeof queryNeracaSchema>;
