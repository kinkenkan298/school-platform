import { db } from "@/db/db";
import { akun, jurnalBaris } from "@/drizzle/schemas/finance";
import { ApiError } from "@/shared/errors/api-error";
import { and, eq } from "drizzle-orm";
import type {
  BuatAkunDTO,
  QueryAkunDTO,
  UpdateAkunDTO,
} from "./akun.validation";

export class AkunService {
  static async ambilSemua(query: QueryAkunDTO) {
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
  }
  static async buat(data: BuatAkunDTO) {
    const [kodeSudahAda] = await db
      .select()
      .from(akun)
      .where(eq(akun.kode, data.kode));

    if (kodeSudahAda) {
      throw ApiError.conflict(`Kode akun "${data.kode}" sudah digunakan`);
    }

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
  }
  static async ambilSatuById(id: string) {
    const [hasil] = await db.select().from(akun).where(eq(akun.id, id));

    if (!hasil) {
      throw ApiError.notFound("Akun tidak ditemukan");
    }

    return hasil;
  }

  static async update(id: string, data: UpdateAkunDTO) {
    await AkunService.ambilSatuById(id);

    if (data.kode) {
      const [kodeSudahAda] = await db
        .select()
        .from(akun)
        .where(and(eq(akun.kode, data.kode), eq(akun.id, id)));

      if (kodeSudahAda && kodeSudahAda.id !== id) {
        throw ApiError.conflict(`Kode akun "${data.kode}" sudah digunakan`);
      }
    }

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
  }
  static async hapus(id: string) {
    await AkunService.ambilSatuById(id);

    const [adaAnak] = await db.select().from(akun).where(eq(akun.indukId, id));

    if (adaAnak) {
      throw ApiError.badRequest(
        "Akun tidak bisa dihapus karena masih memiliki akun turunan",
      );
    }

    const [dipakaiJurnal] = await db
      .select()
      .from(jurnalBaris)
      .where(eq(jurnalBaris.akunId, id));

    if (dipakaiJurnal) {
      throw ApiError.badRequest(
        "Akun tidak bisa dihapus karena sudah dipakai di jurnal",
      );
    }

    await db.delete(akun).where(eq(akun.id, id));
  }
}
