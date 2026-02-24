CREATE TYPE "public"."saldo_normal" AS ENUM('DEBIT', 'KREDIT');--> statement-breakpoint
CREATE TYPE "public"."status_jurnal" AS ENUM('DRAF', 'DIPOSTING', 'DIBATALKAN');--> statement-breakpoint
CREATE TYPE "public"."tipe_akun" AS ENUM('ASET', 'LIABILITAS', 'EKUITAS', 'PENDAPATAN', 'BEBAN');--> statement-breakpoint
CREATE TABLE "akun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" varchar(20) NOT NULL,
	"nama" varchar(100) NOT NULL,
	"tipe" "tipe_akun" NOT NULL,
	"saldo_normal" "saldo_normal" NOT NULL,
	"induk_id" uuid,
	"adalah_induk" boolean DEFAULT false,
	"aktif" boolean DEFAULT true,
	"dibuat_pada" timestamp DEFAULT now(),
	"diperbarui_pada" timestamp DEFAULT now(),
	CONSTRAINT "akun_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "jurnal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nomor" varchar(30) NOT NULL,
	"tanggal" date NOT NULL,
	"periode_id" uuid NOT NULL,
	"keterangan" text,
	"referensi" varchar(100),
	"status" "status_jurnal" DEFAULT 'DRAF' NOT NULL,
	"alasan_batal" text,
	"dibuat_pada" timestamp DEFAULT now(),
	"diperbarui_pada" timestamp DEFAULT now(),
	CONSTRAINT "jurnal_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "jurnal_baris" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurnal_id" uuid NOT NULL,
	"akun_id" uuid NOT NULL,
	"debit" numeric(20, 2) DEFAULT '0' NOT NULL,
	"kredit" numeric(20, 2) DEFAULT '0' NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE "periode_fiskal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bulan" integer NOT NULL,
	"tahun" integer NOT NULL,
	"sudah_ditutup" boolean DEFAULT false,
	"ditutup_pada" timestamp
);
--> statement-breakpoint
ALTER TABLE "akun" ADD CONSTRAINT "akun_induk_id_akun_id_fk" FOREIGN KEY ("induk_id") REFERENCES "public"."akun"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurnal" ADD CONSTRAINT "jurnal_periode_id_periode_fiskal_id_fk" FOREIGN KEY ("periode_id") REFERENCES "public"."periode_fiskal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurnal_baris" ADD CONSTRAINT "jurnal_baris_jurnal_id_jurnal_id_fk" FOREIGN KEY ("jurnal_id") REFERENCES "public"."jurnal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurnal_baris" ADD CONSTRAINT "jurnal_baris_akun_id_akun_id_fk" FOREIGN KEY ("akun_id") REFERENCES "public"."akun"("id") ON DELETE no action ON UPDATE no action;