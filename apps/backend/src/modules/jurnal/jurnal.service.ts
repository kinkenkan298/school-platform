import { db } from "@/db/db";
import {
  akun,
  jurnal,
  jurnalBaris,
  periodeFiskal,
} from "@/drizzle/schemas/finance";
import { ApiError } from "@/shared/errors/api-error";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import type {
  BatalJurnalDTO,
  BuatJurnalDTO,
  QueryJurnalDTO,
  UpdateJurnalDTO,
} from "./jurnal.validation";

export class JurnalService {
  static async generateNomorJurnal(tahun: number): Promise<string> {
    const jurnalTahunIni = await db.select().from(jurnal);
    const jurnalFiltered = jurnalTahunIni.filter((j) =>
      j.nomor.startsWith(`JRN-${tahun}`),
    );

    const urutan = (jurnalFiltered.length + 1).toString().padStart(3, "0");
    return `JRN-${tahun}-${urutan}`;
  }

  static async validasiAkunBaris(akunIds: string[]) {
    const akunDitemukan = await db
      .select()
      .from(akun)
      .where(inArray(akun.id, akunIds));

    if (akunDitemukan.length !== akunIds.length) {
      throw ApiError.notFound(
        "Satu atau lebih akun pada baris jurnal tidak ditemukan",
      );
    }

    const akunInduk = akunDitemukan.filter((a) => a.adalahInduk);
    if (akunInduk.length > 0) {
      const namaAkunInduk = akunInduk
        .map((a) => `${a.kode} - ${a.nama}`)
        .join(", ");
      throw ApiError.badRequest(
        `Akun induk tidak bisa dipakai di baris jurnal: ${namaAkunInduk}`,
      );
    }

    const akunTidakAktif = akunDitemukan.filter((a) => !a.aktif);
    if (akunTidakAktif.length > 0) {
      const namaAkunTidakAktif = akunTidakAktif
        .map((a) => `${a.kode} - ${a.nama}`)
        .join(", ");
      throw ApiError.badRequest(
        `Akun tidak aktif tidak bisa dipakai di baris jurnal: ${namaAkunTidakAktif}`,
      );
    }
  }
  static async ambilSemua(query: QueryJurnalDTO) {
    const kondisi = [];

    if (query.status) {
      kondisi.push(eq(jurnal.status, query.status));
    }

    if (query.periodeId) {
      kondisi.push(eq(jurnal.periodeId, query.periodeId));
    }

    if (query.dari) {
      kondisi.push(gte(jurnal.tanggal, query.dari));
    }

    if (query.sampai) {
      kondisi.push(lte(jurnal.tanggal, query.sampai));
    }

    const hasil = await db
      .select()
      .from(jurnal)
      .where(kondisi.length > 0 ? and(...kondisi) : undefined)
      .orderBy(jurnal.tanggal, jurnal.nomor);

    return hasil;
  }
  static async ambilSatuById(id: string) {
    const [headerJurnal] = await db
      .select()
      .from(jurnal)
      .where(eq(jurnal.id, id));

    if (!headerJurnal) {
      throw ApiError.notFound("Jurnal tidak ditemukan");
    }

    const baris = await db
      .select({
        id: jurnalBaris.id,
        akunId: jurnalBaris.akunId,
        kodeAkun: akun.kode,
        namaAkun: akun.nama,
        debit: jurnalBaris.debit,
        kredit: jurnalBaris.kredit,
        keterangan: jurnalBaris.keterangan,
      })
      .from(jurnalBaris)
      .innerJoin(akun, eq(jurnalBaris.akunId, akun.id))
      .where(eq(jurnalBaris.jurnalId, id));

    return { ...headerJurnal, baris };
  }
  static async buat(data: BuatJurnalDTO) {
    const [periode] = await db
      .select()
      .from(periodeFiskal)
      .where(eq(periodeFiskal.id, data.periodeId));

    if (!periode) {
      throw ApiError.notFound("Periode fiskal tidak ditemukan");
    }

    if (periode.sudahDitutup) {
      throw ApiError.badRequest(
        `Periode ${periode.bulan}/${periode.tahun} sudah ditutup, tidak bisa menambahkan jurnal`,
      );
    }

    const akunIds = data.baris.map((b) => b.akunId);
    await this.validasiAkunBaris(akunIds);

    const tanggalDate = new Date(data.tanggal);
    const nomor = await this.generateNomorJurnal(tanggalDate.getFullYear());

    const jurnalBaru = await db.transaction(async (trx) => {
      const [headerBaru] = await trx
        .insert(jurnal)
        .values({
          nomor,
          tanggal: data.tanggal.toString(),
          periodeId: data.periodeId,
          keterangan: data.keterangan,
          referensi: data.referensi,
          status: "DRAF",
        })
        .returning();

      await trx.insert(jurnalBaris).values(
        data.baris.map((b) => ({
          jurnalId: headerBaru.id,
          akunId: b.akunId,
          debit: b.debit.toString(),
          kredit: b.kredit.toString(),
          keterangan: b.keterangan,
        })),
      );

      return headerBaru;
    });

    return this.ambilSatuById(jurnalBaru.id);
  }
  static async update(id: string, data: UpdateJurnalDTO) {
    const jurnalAda = await this.ambilSatuById(id);

    if (jurnalAda.status !== "DRAF") {
      throw ApiError.badRequest(
        "Jurnal hanya bisa diubah jika masih berstatus DRAF",
      );
    }

    const [periode] = await db
      .select()
      .from(periodeFiskal)
      .where(eq(periodeFiskal.id, data.periodeId));

    if (!periode) {
      throw ApiError.notFound("Periode fiskal tidak ditemukan");
    }

    if (periode.sudahDitutup) {
      throw ApiError.badRequest(
        `Periode ${periode.bulan}/${periode.tahun} sudah ditutup`,
      );
    }

    const akunIds = data.baris.map((b) => b.akunId);
    await this.validasiAkunBaris(akunIds);

    await db.transaction(async (trx) => {
      await trx
        .update(jurnal)
        .set({
          tanggal: data.tanggal.toString(),
          periodeId: data.periodeId,
          keterangan: data.keterangan,
          referensi: data.referensi,
          diperbaruiPada: new Date(),
        })
        .where(eq(jurnal.id, id));

      await trx.delete(jurnalBaris).where(eq(jurnalBaris.jurnalId, id));

      await trx.insert(jurnalBaris).values(
        data.baris.map((b) => ({
          jurnalId: id,
          akunId: b.akunId,
          debit: b.debit.toString(),
          kredit: b.kredit.toString(),
          keterangan: b.keterangan,
        })),
      );
    });

    return this.ambilSatuById(id);
  }
  static async posting(id: string) {
    const jurnalAda = await this.ambilSatuById(id);

    if (jurnalAda.status !== "DRAF") {
      throw ApiError.badRequest(
        "Hanya jurnal berstatus DRAF yang bisa diposting",
      );
    }

    const [periode] = await db
      .select()
      .from(periodeFiskal)
      .where(eq(periodeFiskal.id, jurnalAda.periodeId));

    if (periode?.sudahDitutup) {
      throw ApiError.badRequest(
        "Tidak bisa memposting jurnal ke periode yang sudah ditutup",
      );
    }

    const [jurnalDiposting] = await db
      .update(jurnal)
      .set({
        status: "DIPOSTING",
        diperbaruiPada: new Date(),
      })
      .where(eq(jurnal.id, id))
      .returning();

    return jurnalDiposting;
  }

  static async batal(id: string, data: BatalJurnalDTO) {
    const jurnalAda = await this.ambilSatuById(id);

    if (jurnalAda.status === "DIBATALKAN") {
      throw ApiError.badRequest("Jurnal ini sudah dibatalkan sebelumnya");
    }

    const [jurnalDibatalkan] = await db
      .update(jurnal)
      .set({
        status: "DIBATALKAN",
        alasanBatal: data.alasanBatal,
        diperbaruiPada: new Date(),
      })
      .where(eq(jurnal.id, id))
      .returning();

    return jurnalDibatalkan;
  }

  static async hapus(id: string) {
    const jurnalAda = await this.ambilSatuById(id);

    if (jurnalAda.status !== "DRAF") {
      throw ApiError.badRequest(
        "Jurnal hanya bisa dihapus jika masih berstatus DRAF",
      );
    }

    await db.transaction(async (trx) => {
      await trx.delete(jurnalBaris).where(eq(jurnalBaris.jurnalId, id));
      await trx.delete(jurnal).where(eq(jurnal.id, id));
    });
  }
}

// export const jurnalService = {
// };
