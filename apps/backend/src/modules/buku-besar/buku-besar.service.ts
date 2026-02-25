import { db } from "@/db/db";
import { akun, jurnal, jurnalBaris } from "@/drizzle";
import { ApiError } from "@/shared/errors/api-error";
import { and, eq, gte, lt, lte } from "drizzle-orm";
import { QueryBukuBesarDTO } from "./buku-besar.validation";

export class BukuBesarService {
  static hitungSaldo(
    transaksi: { debit: string; kredit: string }[],
    saldoNormal: "DEBIT" | "KREDIT",
  ): number {
    return transaksi.reduce((saldo, t) => {
      const debit = parseFloat(t.debit);
      const kredit = parseFloat(t.kredit);

      if (saldoNormal === "DEBIT") {
        return saldo + debit - kredit;
      } else {
        return saldo + kredit - debit;
      }
    }, 0);
  }
  static async ambilLaporan(query: QueryBukuBesarDTO) {
    const [dataAkun] = await db
      .select()
      .from(akun)
      .where(eq(akun.id, query.akunId));

    if (!dataAkun) {
      throw ApiError.notFound("Akun tidak ditemukan");
    }

    if (dataAkun.adalahInduk) {
      throw ApiError.badRequest(
        "Buku besar tidak bisa ditampilkan untuk akun induk, pilih akun detail",
      );
    }

    const transaksiSebelumPeriode = await db
      .select({
        debit: jurnalBaris.debit,
        kredit: jurnalBaris.kredit,
      })
      .from(jurnalBaris)
      .innerJoin(jurnal, eq(jurnalBaris.jurnalId, jurnal.id))
      .where(
        and(
          eq(jurnalBaris.akunId, query.akunId),
          eq(jurnal.status, "DIPOSTING"),
          lt(jurnal.tanggal, query.dari),
        ),
      );

    const saldoAwal = this.hitungSaldo(
      transaksiSebelumPeriode,
      dataAkun.saldoNormal,
    );

    const transaksiPeriode = await db
      .select({
        id: jurnalBaris.id,
        tanggal: jurnal.tanggal,
        nomorJurnal: jurnal.nomor,
        keterangan: jurnal.keterangan,
        referensi: jurnal.referensi,
        keteranganBaris: jurnalBaris.keterangan,
        debit: jurnalBaris.debit,
        kredit: jurnalBaris.kredit,
      })
      .from(jurnalBaris)
      .innerJoin(jurnal, eq(jurnalBaris.jurnalId, jurnal.id))
      .where(
        and(
          eq(jurnalBaris.akunId, query.akunId),
          eq(jurnal.status, "DIPOSTING"),
          gte(jurnal.tanggal, query.dari),
          lte(jurnal.tanggal, query.sampai),
        ),
      )
      .orderBy(jurnal.tanggal, jurnal.nomor);

    let saldoBerjalan = saldoAwal;

    const baris = transaksiPeriode.map((t) => {
      const debit = parseFloat(t.debit);
      const kredit = parseFloat(t.kredit);

      if (dataAkun.saldoNormal === "DEBIT") {
        saldoBerjalan = saldoBerjalan + debit - kredit;
      } else {
        saldoBerjalan = saldoBerjalan + kredit - debit;
      }

      return {
        id: t.id,
        tanggal: t.tanggal,
        nomorJurnal: t.nomorJurnal,
        keterangan: t.keterangan ?? t.keteranganBaris ?? "-",
        referensi: t.referensi ?? "-",
        debit,
        kredit,
        saldo: saldoBerjalan,
      };
    });

    const totalDebit = baris.reduce((acc, b) => acc + b.debit, 0);
    const totalKredit = baris.reduce((acc, b) => acc + b.kredit, 0);
    const saldoAkhir = saldoBerjalan;

    return {
      akun: {
        id: dataAkun.id,
        kode: dataAkun.kode,
        nama: dataAkun.nama,
        tipe: dataAkun.tipe,
        saldoNormal: dataAkun.saldoNormal,
      },
      periode: {
        dari: query.dari,
        sampai: query.sampai,
      },
      saldoAwal,
      baris,
      totalDebit,
      totalKredit,
      saldoAkhir,
    };
  }
}
