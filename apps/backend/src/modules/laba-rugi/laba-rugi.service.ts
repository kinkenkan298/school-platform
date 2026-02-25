import { db } from "@/db/db";
import { akun, jurnal, jurnalBaris } from "@/drizzle";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { QueryLabaRugiDTO } from "./laba-rugi.validation";

export class LabaRugiService {
  static buildResponKosong(query: QueryLabaRugiDTO) {
    return {
      periode: { dari: query.dari, sampai: query.sampai },
      pendapatan: { baris: [], total: 0 },
      beban: { baris: [], total: 0 },
      labaRugiBersih: 0,
      status: "LABA",
    };
  }
  static async ambilLaporan(query: QueryLabaRugiDTO) {
    const semuaAkun = await db
      .select()
      .from(akun)
      .where(
        and(
          inArray(akun.tipe, ["PENDAPATAN", "BEBAN"]),
          eq(akun.aktif, true),
          eq(akun.adalahInduk, false),
        ),
      )
      .orderBy(akun.kode);

    if (semuaAkun.length === 0) {
      return this.buildResponKosong(query);
    }

    const akunIds = semuaAkun.map((a) => a.id);

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
          gte(jurnal.tanggal, query.dari),
          lte(jurnal.tanggal, query.sampai),
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

    const akunPendapatan = semuaAkun.filter((a) => a.tipe === "PENDAPATAN");
    const akunBeban = semuaAkun.filter((a) => a.tipe === "BEBAN");

    const barisPendapatan = akunPendapatan.map((a) => {
      const total = totalPerAkun.get(a.id) ?? { debit: 0, kredit: 0 };
      const jumlah = total.kredit - total.debit;
      return { id: a.id, kode: a.kode, nama: a.nama, jumlah };
    });

    const barisBeban = akunBeban.map((a) => {
      const total = totalPerAkun.get(a.id) ?? { debit: 0, kredit: 0 };
      const jumlah = total.debit - total.kredit;
      return { id: a.id, kode: a.kode, nama: a.nama, jumlah };
    });

    const totalPendapatan = barisPendapatan.reduce(
      (acc, b) => acc + b.jumlah,
      0,
    );
    const totalBeban = barisBeban.reduce((acc, b) => acc + b.jumlah, 0);
    const labaRugiBersih = totalPendapatan - totalBeban;

    return {
      periode: {
        dari: query.dari,
        sampai: query.sampai,
      },
      pendapatan: {
        baris: barisPendapatan,
        total: totalPendapatan,
      },
      beban: {
        baris: barisBeban,
        total: totalBeban,
      },
      labaRugiBersih,
      status: labaRugiBersih >= 0 ? "LABA" : "RUGI",
    };
  }
}
