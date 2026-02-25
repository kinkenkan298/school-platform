import { z } from "zod";

export const barisJurnalSchema = z.object({
  akunId: z.uuid("Format akun ID tidak valid"),

  debit: z
    .number({ error: "Debit wajib diisi" })
    .min(0, "Debit tidak boleh negatif")
    .default(0),

  kredit: z
    .number({ error: "Kredit wajib diisi" })
    .min(0, "Kredit tidak boleh negatif")
    .default(0),

  keterangan: z.string().max(255).optional(),
});

export const buatJurnalSchema = z
  .object({
    tanggal: z.iso.date("Format tanggal tidak valid, gunakan YYYY-MM-DD"),

    periodeId: z.uuid("Format periode ID tidak valid"),

    keterangan: z.string().max(500).optional(),

    referensi: z.string().max(100).optional(),

    baris: z
      .array(barisJurnalSchema)
      .min(2, "Jurnal minimal memiliki 2 baris transaksi"),
  })
  .refine(
    (data) => {
      const totalDebit = data.baris.reduce((acc, b) => acc + b.debit, 0);
      const totalKredit = data.baris.reduce((acc, b) => acc + b.kredit, 0);
      return totalDebit === totalKredit;
    },
    { message: "Total debit harus sama dengan total kredit" },
  )
  .refine(
    (data) => {
      return data.baris.every((b) => !(b.debit === 0 && b.kredit === 0));
    },
    { message: "Setiap baris harus memiliki nilai debit atau kredit" },
  )
  .refine(
    (data) => {
      return data.baris.every((b) => !(b.debit > 0 && b.kredit > 0));
    },
    { message: "Setiap baris tidak boleh memiliki debit dan kredit sekaligus" },
  );

export const updateJurnalSchema = buatJurnalSchema;

export const batalJurnalSchema = z.object({
  alasanBatal: z
    .string({ error: "Alasan pembatalan wajib diisi" })
    .min(1, "Alasan pembatalan tidak boleh kosong")
    .max(500, "Alasan pembatalan maksimal 500 karakter"),
});

export const queryJurnalSchema = z.object({
  status: z.enum(["DRAF", "DIPOSTING", "DIBATALKAN"]).optional(),
  periodeId: z.uuid("Format periode ID tidak valid").optional(),
  dari: z.iso.date("Format tanggal tidak valid, gunakan YYYY-MM-DD").optional(),
  sampai: z.iso
    .date("Format tanggal tidak valid, gunakan YYYY-MM-DD")
    .optional(),
});

export type BarisJurnalDTO = z.infer<typeof barisJurnalSchema>;
export type BuatJurnalDTO = z.infer<typeof buatJurnalSchema>;
export type UpdateJurnalDTO = z.infer<typeof updateJurnalSchema>;
export type BatalJurnalDTO = z.infer<typeof batalJurnalSchema>;
export type QueryJurnalDTO = z.infer<typeof queryJurnalSchema>;
