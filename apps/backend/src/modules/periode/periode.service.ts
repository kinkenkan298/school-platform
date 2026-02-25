import { db } from "@/db/db";
import { periodeFiskal } from "@/drizzle/schemas/finance";
import { ApiError } from "@/shared/errors/api-error";
import { and, eq } from "drizzle-orm";
import type { BuatPeriodeDTO } from "./periode.validation";

export class PeriodeFiskalService {
  static async ambilSemua() {
    const hasil = await db
      .select()
      .from(periodeFiskal)
      .orderBy(periodeFiskal.tahun, periodeFiskal.bulan);

    return hasil;
  }

  static async ambilSatuById(id: string) {
    const [hasil] = await db
      .select()
      .from(periodeFiskal)
      .where(eq(periodeFiskal.id, id));

    if (!hasil) {
      throw ApiError.notFound("Periode fiskal tidak ditemukan");
    }

    return hasil;
  }

  static async buat(data: BuatPeriodeDTO) {
    const [sudahAda] = await db
      .select()
      .from(periodeFiskal)
      .where(
        and(
          eq(periodeFiskal.bulan, data.bulan),
          eq(periodeFiskal.tahun, data.tahun),
        ),
      );

    if (sudahAda) {
      throw ApiError.conflict(`Periode ${data.bulan}/${data.tahun} sudah ada`);
    }

    const [periodeBaru] = await db
      .insert(periodeFiskal)
      .values({
        bulan: data.bulan,
        tahun: data.tahun,
        sudahDitutup: false,
      })
      .returning();

    return periodeBaru;
  }

  static async tutup(id: string) {
    const periode = await this.ambilSatuById(id);

    if (periode.sudahDitutup) {
      throw ApiError.badRequest("Periode ini sudah ditutup sebelumnya");
    }

    const [periodeDitutup] = await db
      .update(periodeFiskal)
      .set({
        sudahDitutup: true,
        ditutupPada: new Date(),
      })
      .where(eq(periodeFiskal.id, id))
      .returning();

    return periodeDitutup;
  }
}
