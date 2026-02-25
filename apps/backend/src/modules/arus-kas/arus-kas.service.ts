import { db } from "@/db/db";
import { akun, jurnal, jurnalBaris } from "@/drizzle/schemas/finance";
import { and, eq, gte, inArray, lt, lte } from "drizzle-orm";
import { QueryArusKasDTO } from "./arus-kas.validation";

type BarisArusKas = {
  tanggal: string;
  nomorJurnal: string;
  keterangan: string;
  referensi: string;
  namaAkun: string;
  kasmasuk: number;
  kasKeluar: number;
};

export class ArusKasService {
  protected static KODE_AWALAN_KAS = ["1101", "1102", "1103", "1104"];

  static buildResponKosong(query: QueryArusKasDTO) {
    return {
      periode: { dari: query.dari, sampai: query.sampai },
      saldoAwal: 0,
      baris: [],
      totalKasMasuk: 0,
      totalKasKeluar: 0,
      netArusKas: 0,
      saldoAkhir: 0,
      ringkasanPerAkun: [],
    };
  }
  static async ambilLaporan(query: QueryArusKasDTO) {
    const semuaAkun = await db
      .select()
      .from(akun)
      .where(and(eq(akun.aktif, true), eq(akun.adalahInduk, false)));

    const akunKas = semuaAkun.filter((a) =>
      this.KODE_AWALAN_KAS.some((kode) => a.kode.startsWith(kode)),
    );

    if (akunKas.length === 0) {
      return this.buildResponKosong(query);
    }

    const akunKasIds = akunKas.map((a) => a.id);

    const transaksiSebelumPeriode = await db
      .select({
        akunId: jurnalBaris.akunId,
        debit: jurnalBaris.debit,
        kredit: jurnalBaris.kredit,
      })
      .from(jurnalBaris)
      .innerJoin(jurnal, eq(jurnalBaris.jurnalId, jurnal.id))
      .where(
        and(
          inArray(jurnalBaris.akunId, akunKasIds),
          eq(jurnal.status, "DIPOSTING"),
          lt(jurnal.tanggal, query.dari),
        ),
      );

    const saldoAwal = transaksiSebelumPeriode.reduce((saldo, t) => {
      return saldo + parseFloat(t.debit) - parseFloat(t.kredit);
    }, 0);

    const transaksiPeriode = await db
      .select({
        tanggal: jurnal.tanggal,
        nomorJurnal: jurnal.nomor,
        keterangan: jurnal.keterangan,
        referensi: jurnal.referensi,
        namaAkun: akun.nama,
        kodeAkun: akun.kode,
        debit: jurnalBaris.debit,
        kredit: jurnalBaris.kredit,
        keteranganBaris: jurnalBaris.keterangan,
      })
      .from(jurnalBaris)
      .innerJoin(jurnal, eq(jurnalBaris.jurnalId, jurnal.id))
      .innerJoin(akun, eq(jurnalBaris.akunId, akun.id))
      .where(
        and(
          inArray(jurnalBaris.akunId, akunKasIds),
          eq(jurnal.status, "DIPOSTING"),
          gte(jurnal.tanggal, query.dari),
          lte(jurnal.tanggal, query.sampai),
        ),
      )
      .orderBy(jurnal.tanggal, jurnal.nomor);

    const baris: BarisArusKas[] = transaksiPeriode.map((t) => ({
      tanggal: t.tanggal,
      nomorJurnal: t.nomorJurnal,
      keterangan: t.keterangan ?? t.keteranganBaris ?? "-",
      referensi: t.referensi ?? "-",
      namaAkun: t.namaAkun,
      kasmasuk: parseFloat(t.debit),
      kasKeluar: parseFloat(t.kredit),
    }));

    const totalKasMasuk = baris.reduce((acc, b) => acc + b.kasmasuk, 0);
    const totalKasKeluar = baris.reduce((acc, b) => acc + b.kasKeluar, 0);
    const netArusKas = totalKasMasuk - totalKasKeluar;
    const saldoAkhir = saldoAwal + netArusKas;

    const ringkasanPerAkun = akunKas.map((a) => {
      const transaksiAkun = transaksiPeriode.filter(
        (t) => t.namaAkun === a.nama,
      );
      const masuk = transaksiAkun.reduce(
        (acc, t) => acc + parseFloat(t.debit),
        0,
      );
      const keluar = transaksiAkun.reduce(
        (acc, t) => acc + parseFloat(t.kredit),
        0,
      );

      return {
        kode: a.kode,
        nama: a.nama,
        kasMasuk: masuk,
        kasKeluar: keluar,
        net: masuk - keluar,
      };
    });

    return {
      periode: {
        dari: query.dari,
        sampai: query.sampai,
      },
      saldoAwal,
      baris,
      totalKasMasuk,
      totalKasKeluar,
      netArusKas,
      saldoAkhir,
      ringkasanPerAkun,
    };
  }
}
