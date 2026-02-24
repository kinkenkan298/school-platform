import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  date,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

export const tipeAkunEnum = pgEnum("tipe_akun", [
  "ASET",
  "LIABILITAS",
  "EKUITAS",
  "PENDAPATAN",
  "BEBAN",
]);
export const saldoNormalEnum = pgEnum("saldo_normal", ["DEBIT", "KREDIT"]);

export const statusJurnalEnum = pgEnum("status_jurnal", [
  "DRAF",
  "DIPOSTING",
  "DIBATALKAN",
]);

export const akun = pgTable("akun", {
  id: uuid("id").primaryKey().defaultRandom(),
  kode: varchar("kode", { length: 20 }).notNull().unique(),
  nama: varchar("nama", { length: 100 }).notNull(),
  tipe: tipeAkunEnum("tipe").notNull(),
  saldoNormal: saldoNormalEnum("saldo_normal").notNull(),
  indukId: uuid("induk_id").references((): AnyPgColumn => akun.id),
  adalahInduk: boolean("adalah_induk").default(false),
  aktif: boolean("aktif").default(true),
  dibuatPada: timestamp("dibuat_pada").defaultNow(),
  diperbaruiPada: timestamp("diperbarui_pada").defaultNow(),
});

export const periodeFiskal = pgTable("periode_fiskal", {
  id: uuid("id").primaryKey().defaultRandom(),
  bulan: integer("bulan").notNull(),
  tahun: integer("tahun").notNull(),
  sudahDitutup: boolean("sudah_ditutup").default(false),
  ditutupPada: timestamp("ditutup_pada"),
});

export const jurnal = pgTable("jurnal", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomor: varchar("nomor", { length: 30 }).notNull().unique(),
  tanggal: date("tanggal").notNull(),
  periodeId: uuid("periode_id")
    .references(() => periodeFiskal.id)
    .notNull(),
  keterangan: text("keterangan"),
  referensi: varchar("referensi", { length: 100 }),
  status: statusJurnalEnum("status").notNull().default("DRAF"),
  alasanBatal: text("alasan_batal"),
  dibuatPada: timestamp("dibuat_pada").defaultNow(),
  diperbaruiPada: timestamp("diperbarui_pada").defaultNow(),
});

export const jurnalBaris = pgTable("jurnal_baris", {
  id: uuid("id").primaryKey().defaultRandom(),
  jurnalId: uuid("jurnal_id")
    .references(() => jurnal.id)
    .notNull(),
  akunId: uuid("akun_id")
    .references(() => akun.id)
    .notNull(),
  debit: numeric("debit", { precision: 20, scale: 2 }).notNull().default("0"),
  kredit: numeric("kredit", { precision: 20, scale: 2 }).notNull().default("0"),
  keterangan: text("keterangan"),
});
