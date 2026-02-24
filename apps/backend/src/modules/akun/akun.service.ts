import { eq, and } from "drizzle-orm";
import { db } from "@/db/db";
import { akun } from "@/drizzle/schemas/finance";
import { ApiError } from "@/shared/errors/api-error";
import type {
  BuatAkunDTO,
  QueryAkunDTO,
  UpdateAkunDTO,
} from "./akun.validation";

export const akunService = {
  async ambilSemua(query: QueryAkunDTO) {
    const kondisi = [];

    if (query.tipe) {
      kondisi.push(eq(akun.tipe, query.tipe));
    }

    if (query.aktif !== undefined) {
      kondisi.push(eq(akun.aktif, query.aktif));
    }

    if (query.indukId) {
      kondisi.push(eq(akun.indukId, query.indukId));
    }

    const hasil = await db
      .select()
      .from(akun)
      .where(kondisi.length > 0 ? and(...kondisi) : undefined);

    return hasil;
  },

  async ambilSatuById(id: string) {
    const [hasil] = await db.select().from(akun).where(eq(akun.id, id));

    if (!hasil) {
      throw ApiError.notFound("Akun tidak ditemukan");
    }

    return hasil;
  },

  async buat(data: BuatAkunDTO) {
    // Cek kode akun sudah dipakai atau belum
    const [kodeSudahAda] = await db
      .select()
      .from(akun)
      .where(eq(akun.kode, data.kode));

    if (kodeSudahAda) {
      throw ApiError.conflict(`Kode akun "${data.kode}" sudah digunakan`);
    }

    // Jika ada indukId, validasi bahwa induk tersebut ada dan memang adalah akun induk
    if (data.indukId) {
      const [induk] = await db
        .select()
        .from(akun)
        .where(eq(akun.id, data.indukId));

      if (!induk) {
        throw ApiError.notFound("Akun induk tidak ditemukan");
      }

      if (!induk.adalahInduk) {
        throw ApiError.badRequest(
          "Akun yang dipilih sebagai induk bukan merupakan akun induk",
        );
      }
    }

    const [akunBaru] = await db
      .insert(akun)
      .values({
        kode: data.kode,
        nama: data.nama,
        tipe: data.tipe,
        saldoNormal: data.saldoNormal,
        indukId: data.indukId ?? null,
        adalahInduk: data.adalahInduk,
        aktif: data.aktif,
      })
      .returning();

    return akunBaru;
  },

  async update(id: string, data: UpdateAkunDTO) {
    // Pastikan akun ada
    await akunService.ambilSatuById(id);

    // Jika kode diubah, cek apakah kode baru sudah dipakai akun lain
    if (data.kode) {
      const [kodeSudahAda] = await db
        .select()
        .from(akun)
        .where(and(eq(akun.kode, data.kode), eq(akun.id, id)));

      // Jika ada akun lain dengan kode yang sama (bukan dirinya sendiri)
      if (kodeSudahAda && kodeSudahAda.id !== id) {
        throw ApiError.conflict(`Kode akun "${data.kode}" sudah digunakan`);
      }
    }

    // Jika indukId diubah, validasi akun induk baru
    if (data.indukId) {
      if (data.indukId === id) {
        throw ApiError.badRequest(
          "Akun tidak bisa menjadi induk dari dirinya sendiri",
        );
      }

      const [induk] = await db
        .select()
        .from(akun)
        .where(eq(akun.id, data.indukId));

      if (!induk) {
        throw ApiError.notFound("Akun induk tidak ditemukan");
      }

      if (!induk.adalahInduk) {
        throw ApiError.badRequest(
          "Akun yang dipilih sebagai induk bukan merupakan akun induk",
        );
      }
    }

    const [akunDiperbarui] = await db
      .update(akun)
      .set({
        ...data,
        diperbaruiPada: new Date(),
      })
      .where(eq(akun.id, id))
      .returning();

    return akunDiperbarui;
  },

  async hapus(id: string) {
    // Pastikan akun ada
    await akunService.ambilSatuById(id);

    // Cek apakah akun ini dipakai sebagai induk oleh akun lain
    const [adaAnak] = await db.select().from(akun).where(eq(akun.indukId, id));

    if (adaAnak) {
      throw ApiError.badRequest(
        "Akun tidak bisa dihapus karena masih memiliki akun turunan",
      );
    }

    // TODO: Cek apakah akun sudah dipakai di jurnal baris
    // (akan ditambahkan setelah tabel jurnal_baris siap dipakai)

    await db.delete(akun).where(eq(akun.id, id));
  },
};
