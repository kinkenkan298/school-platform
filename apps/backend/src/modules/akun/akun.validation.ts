import { z } from "zod";

export const buatAkunSchema = z.object({
  kode: z
    .string({ error: "Kode akun wajib diisi" })
    .min(1, "Kode akun tidak boleh kosong")
    .max(20, "Kode akun maksimal 20 karakter"),

  nama: z
    .string({ error: "Nama akun wajib diisi" })
    .min(1, "Nama akun tidak boleh kosong")
    .max(100, "Nama akun maksimal 100 karakter"),

  tipe: z.enum(["ASET", "LIABILITAS", "EKUITAS", "PENDAPATAN", "BEBAN"], {
    error: "Tipe akun wajib diisi",
  }),

  saldoNormal: z.enum(["DEBIT", "KREDIT"], {
    error: "Saldo normal wajib diisi",
  }),

  indukId: z.uuid("Format induk ID tidak valid").nullable().optional(),

  adalahInduk: z.boolean().optional().default(false),

  aktif: z.boolean().optional().default(true),
});

export const updateAkunSchema = buatAkunSchema.partial();

export const queryAkunSchema = z.object({
  tipe: z
    .enum(["ASET", "LIABILITAS", "EKUITAS", "PENDAPATAN", "BEBAN"])
    .optional(),
  aktif: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  indukId: z.string().uuid("Format induk ID tidak valid").optional(),
});

export type BuatAkunDTO = z.infer<typeof buatAkunSchema>;
export type UpdateAkunDTO = z.infer<typeof updateAkunSchema>;
export type QueryAkunDTO = z.infer<typeof queryAkunSchema>;
