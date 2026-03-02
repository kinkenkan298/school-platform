import { db } from "@/db/db";
import { akun, jurnal, jurnalBaris } from "@/drizzle/schemas/finance";
import { and, eq, inArray, lte } from "drizzle-orm";
import { QueryNeracaDTO } from "./neraca.validation";

export class NeracaService {
  static buildResponKosong(query: QueryNeracaDTO) {
    return {
      tanggal: query.sampai,
      aset: { baris: [], total: 0 },
      liabilitas: { baris: [], total: 0 },
      ekuitas: { baris: [], labaRugiBerjalan: 0, total: 0 },
      totalLiabilitasDanEkuitas: 0,
      seimbang: true,
    };
  }
  static async hitungLabaRugiBerjalan(sampai: string): Promise<number> {
    const akunLabaRugi = await db
      .select()
      .from(akun)
      .where(
        and(
          inArray(akun.tipe, ["PENDAPATAN", "BEBAN"]),
          eq(akun.aktif, true),
          eq(akun.adalahInduk, false),
        ),
      );

    if (akunLabaRugi.length === 0) return 0;

    const akunIds = akunLabaRugi.map((a) => a.id);

    const transaksi = await db
      .select({
        akunId: jurnalBaris.akunId,
        debit: jurnalBaris.debit,
        kredit: jurnalBaris.kredit,
      })
      .from(jurnalBaris)
      .innerJoin(jurnal, eq(jurnalBaris.jurnalId, jurnal.id))
      .where(
        and(
          inArray(jurnalBaris.akunId, akunIds),
          eq(jurnal.status, "DIPOSTING"),
          lte(jurnal.tanggal, sampai),
        ),
      );

    const totalPerAkun = new Map<string, { debit: number; kredit: number }>();
    for (const t of transaksi) {
      const ada = totalPerAkun.get(t.akunId) ?? { debit: 0, kredit: 0 };
      totalPerAkun.set(t.akunId, {
        debit: ada.debit + parseFloat(t.debit),
        kredit: ada.kredit + parseFloat(t.kredit),
      });
    }

    let totalPendapatan = 0;
    let totalBeban = 0;

    for (const a of akunLabaRugi) {
      const total = totalPerAkun.get(a.id) ?? { debit: 0, kredit: 0 };
      if (a.tipe === "PENDAPATAN") {
        totalPendapatan += total.kredit - total.debit;
      } else {
        totalBeban += total.debit - total.kredit;
      }
    }

    return totalPendapatan - totalBeban;
  }
}
