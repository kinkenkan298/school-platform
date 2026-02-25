import { z } from "zod";

export const queryLabaRugiSchema = z
  .object({
    dari: z.iso.date("Format tanggal tidak valid, gunakan YYYY-MM-DD"),
    sampai: z.iso.date("Format tanggal tidak valid, gunakan YYYY-MM-DD"),
  })
  .refine((data) => data.dari <= data.sampai, {
    message: "Tanggal dari tidak boleh lebih besar dari tanggal sampai",
  });

export type QueryLabaRugiDTO = z.infer<typeof queryLabaRugiSchema>;
