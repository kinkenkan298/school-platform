# Dokumentasi Backend Finance MVP
> Aplikasi SaaS Keuangan Sekolah  
> Stack: TypeScript · Express · PostgreSQL · Drizzle ORM

---

## Daftar Isi

1. [Arsitektur & Struktur Folder](#1-arsitektur--struktur-folder)
2. [Schema Database](#2-schema-database)
3. [Business Rules & Validasi](#3-business-rules--validasi)
4. [API Endpoint](#4-api-endpoint)
   - [COA / Akun](#41-coa--akun)
   - [Periode Fiskal](#42-periode-fiskal)
   - [Jurnal](#43-jurnal)
   - [Laporan](#44-laporan)

---

## 1. Arsitektur & Struktur Folder

### Struktur Folder

```
src/
├── db/
│   └── db.ts                        # Koneksi database Drizzle
├── drizzle/
│   ├── index.ts
│   ├── migrations/                  # File migrasi database
│   └── schemas/
│       └── finance.ts               # Schema tabel & enum
├── modules/
│   ├── akun/
│   │   ├── akun.validation.ts       # Zod schema validasi
│   │   ├── akun.service.ts          # Business logic
│   │   ├── akun.controller.ts       # Handler request/response
│   │   └── akun.routes.ts           # Definisi route
│   ├── periode/
│   │   ├── periode.validation.ts
│   │   ├── periode.service.ts
│   │   ├── periode.controller.ts
│   │   └── periode.routes.ts
│   ├── jurnal/
│   │   ├── jurnal.validation.ts
│   │   ├── jurnal.service.ts
│   │   ├── jurnal.controller.ts
│   │   └── jurnal.routes.ts
│   └── laporan/
│       ├── buku-besar.validation.ts
│       ├── buku-besar.service.ts
│       ├── buku-besar.controller.ts
│       ├── laba-rugi.validation.ts
│       ├── laba-rugi.service.ts
│       ├── laba-rugi.controller.ts
│       ├── neraca.validation.ts
│       ├── neraca.service.ts
│       ├── neraca.controller.ts
│       ├── arus-kas.validation.ts
│       ├── arus-kas.service.ts
│       ├── arus-kas.controller.ts
│       └── laporan.routes.ts
├── routes/
│   └── index.ts                     # Registrasi semua route
└── shared/
    ├── config/
    │   └── env.ts
    ├── errors/
    │   └── api-error.ts             # Custom error class
    ├── middleware/
    │   ├── async-handler.ts         # Wrapper async controller
    │   ├── error-handler.ts
    │   └── not-found-handler.ts
    └── utils/
        ├── api-response.ts          # Format response standar
        └── logger.ts
```

### Layer Arsitektur

Setiap modul mengikuti pola 3 layer yang konsisten:

```
Request → Routes → Controller → Service → Database
                      ↓
                  Validation (Zod)
                      ↓
                  ApiError (jika gagal)
                      ↓
                  ApiResponse (jika berhasil)
```

- **Routes** — hanya mendaftarkan endpoint dan menghubungkan ke controller
- **Controller** — menerima request, validasi input, memanggil service, mengembalikan response
- **Service** — seluruh business logic, query database, validasi bisnis

### Format Response Standar

**Berhasil (data tunggal atau list):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data akun",
  "data": { ... }
}
```

**Berhasil dibuat (HTTP 201):**
```json
{
  "success": true,
  "message": "Akun berhasil dibuat",
  "data": { ... }
}
```

**Gagal:**
```json
{
  "success": false,
  "message": "Data akun tidak valid",
  "errors": {
    "kode": ["Kode akun tidak boleh kosong"],
    "tipe": ["Tipe akun tidak valid"]
  }
}
```

### Kode Error

| Kode HTTP | Keterangan |
|---|---|
| `400 Bad Request` | Input tidak valid atau melanggar business rule |
| `404 Not Found` | Data yang dicari tidak ditemukan |
| `409 Conflict` | Data duplikat (misal kode akun sudah ada) |
| `500 Internal Server Error` | Error tidak terduga di server |

---

## 2. Schema Database

### Enum

```sql
CREATE TYPE tipe_akun AS ENUM ('ASET', 'LIABILITAS', 'EKUITAS', 'PENDAPATAN', 'BEBAN');
CREATE TYPE saldo_normal AS ENUM ('DEBIT', 'KREDIT');
CREATE TYPE status_jurnal AS ENUM ('DRAF', 'DIPOSTING', 'DIBATALKAN');
```

### Tabel `akun` (Chart of Accounts)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `kode` | VARCHAR(20) | Kode akun, unik (contoh: `1101`) |
| `nama` | VARCHAR(100) | Nama akun |
| `tipe` | ENUM tipe_akun | Tipe akun |
| `saldo_normal` | ENUM saldo_normal | Arah saldo normal akun |
| `induk_id` | UUID | Self-reference ke akun induk (nullable) |
| `adalah_induk` | BOOLEAN | Akun induk tidak bisa dipakai di jurnal |
| `aktif` | BOOLEAN | Status aktif akun |
| `dibuat_pada` | TIMESTAMP | Waktu dibuat |
| `diperbarui_pada` | TIMESTAMP | Waktu terakhir diperbarui |

### Tabel `periode_fiskal`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `bulan` | INTEGER | Bulan (1–12) |
| `tahun` | INTEGER | Tahun (2000–2100) |
| `sudah_ditutup` | BOOLEAN | Periode yang ditutup tidak bisa dijurnal |
| `ditutup_pada` | TIMESTAMP | Waktu periode ditutup |

### Tabel `jurnal`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `nomor` | VARCHAR(30) | Nomor jurnal otomatis (contoh: `JRN-2025-001`) |
| `tanggal` | DATE | Tanggal transaksi |
| `periode_id` | UUID | FK ke `periode_fiskal` |
| `keterangan` | TEXT | Deskripsi transaksi |
| `referensi` | VARCHAR(100) | Nomor referensi dokumen (nomor faktur, dll) |
| `status` | ENUM status_jurnal | Status jurnal |
| `alasan_batal` | TEXT | Wajib diisi saat jurnal dibatalkan |
| `dibuat_pada` | TIMESTAMP | Waktu dibuat |
| `diperbarui_pada` | TIMESTAMP | Waktu terakhir diperbarui |

### Tabel `jurnal_baris`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `jurnal_id` | UUID | FK ke `jurnal` |
| `akun_id` | UUID | FK ke `akun` |
| `debit` | NUMERIC(20,2) | Nilai debit |
| `kredit` | NUMERIC(20,2) | Nilai kredit |
| `keterangan` | TEXT | Keterangan baris (opsional) |

### Relasi Antar Tabel

```
akun ──(induk_id, self-reference)──► akun
  ▲
  └── akun_id ◄── jurnal_baris ──► jurnal_id ──► jurnal
                                                    │
                                              periode_id
                                                    │
                                                    ▼
                                            periode_fiskal
```

### Hierarki COA Sekolah

```
1000  ASET
  1100  Aset Lancar
    1101  Kas Sekolah
    1102  Kas BOS
    1103  Kas Komite
    1104  Bank Sekolah
    1105  Piutang SPP
  1200  Aset Tetap
    1201  Peralatan Sekolah
    1202  Inventaris Kelas

2000  LIABILITAS
  2100  Liabilitas Jangka Pendek
    2101  Utang Operasional

3000  EKUITAS
    3101  Dana BOS Diterima

4000  PENDAPATAN
  4100  Pendapatan Rutin
    4101  Pendapatan SPP
    4102  Pendapatan Uang Gedung
    4103  Pendapatan Uang Seragam
  4200  Pendapatan Non-Rutin
    4201  Pendapatan Dana BOS
    4202  Pendapatan Donasi

5000  BEBAN
  5100  Beban Pegawai
    5101  Beban Gaji Guru
    5102  Beban Gaji Staf TU
  5200  Beban Operasional
    5201  Beban Listrik dan Air
    5202  Beban ATK
    5203  Beban Pemeliharaan Gedung
  5300  Beban Program
    5301  Beban Kegiatan Siswa
    5302  Beban Ujian
```

---

## 3. Business Rules & Validasi

### Akun

| Rule | Keterangan |
|---|---|
| Kode akun harus unik | Tidak boleh ada dua akun dengan kode yang sama |
| Akun induk tidak bisa dipakai di jurnal | Hanya akun dengan `adalahInduk: false` yang bisa menjadi baris jurnal |
| Akun tidak aktif tidak bisa dipakai di jurnal | Akun dengan `aktif: false` tidak bisa masuk ke baris jurnal |
| Akun tidak bisa dihapus jika punya anak | Harus hapus semua akun turunan terlebih dahulu |
| Akun tidak bisa dihapus jika sudah dipakai di jurnal | Akun yang sudah pernah masuk ke `jurnal_baris` tidak bisa dihapus |
| Akun tidak bisa menjadi induk dari dirinya sendiri | `indukId` tidak boleh sama dengan `id` akun itu sendiri |
| `indukId` harus menunjuk ke akun yang `adalahInduk: true` | Tidak bisa menjadikan akun detail sebagai induk |

### Saldo Normal Akun

| Tipe Akun | Saldo Normal | Bertambah saat | Berkurang saat |
|---|---|---|---|
| ASET | DEBIT | Debit | Kredit |
| BEBAN | DEBIT | Debit | Kredit |
| LIABILITAS | KREDIT | Kredit | Debit |
| EKUITAS | KREDIT | Kredit | Debit |
| PENDAPATAN | KREDIT | Kredit | Debit |

### Periode Fiskal

| Rule | Keterangan |
|---|---|
| Periode bulan/tahun harus unik | Tidak boleh ada dua periode dengan bulan dan tahun yang sama |
| Periode yang sudah ditutup tidak bisa dibuka kembali | `sudahDitutup` bersifat permanen |
| Tidak bisa posting jurnal ke periode yang sudah ditutup | Validasi dilakukan saat `POST /jurnal` dan `PATCH /jurnal/:id/posting` |

### Jurnal

| Rule | Keterangan |
|---|---|
| Total debit harus sama dengan total kredit | Prinsip double-entry bookkeeping |
| Jurnal minimal memiliki 2 baris | Tidak bisa jurnal dengan hanya 1 baris |
| Setiap baris wajib memiliki nilai debit atau kredit | Tidak boleh keduanya 0 |
| Setiap baris tidak boleh memiliki debit dan kredit sekaligus | Pilih salah satu per baris |
| Jurnal DRAF bisa diedit dan dihapus | Hanya status DRAF yang bisa dimodifikasi |
| Jurnal DIPOSTING tidak bisa diedit | Hanya bisa dibatalkan dengan `PATCH /:id/batal` |
| Jurnal DIBATALKAN tidak bisa diposting ulang | Status DIBATALKAN bersifat final |
| Pembatalan wajib menyertakan alasan | Field `alasanBatal` wajib diisi |
| Nomor jurnal digenerate otomatis | Format: `JRN-{TAHUN}-{URUTAN}`, contoh: `JRN-2025-001` |

### Laporan

| Rule | Keterangan |
|---|---|
| Semua laporan hanya menghitung jurnal DIPOSTING | Jurnal DRAF dan DIBATALKAN tidak ikut dihitung |
| Buku besar hanya untuk akun detail | Akun induk tidak bisa ditampilkan di buku besar |
| Saldo awal buku besar dihitung akumulatif | Semua transaksi sebelum tanggal `dari` ikut dihitung |
| Neraca menggunakan satu titik waktu | Query parameter hanya `sampai`, bukan range |
| Laba rugi berjalan masuk ke ekuitas di neraca | Agar persamaan Aset = Liabilitas + Ekuitas tetap seimbang |
| Arus kas diidentifikasi berdasarkan kode akun | Akun kas: `1101`, `1102`, `1103`, `1104` |

---

## 4. API Endpoint

**Base URL:** `http://localhost:3001/api/v1`

---

### 4.1 COA / Akun

#### `GET /akun` — Ambil Semua Akun

**Query Params (opsional):**

| Param | Tipe | Contoh |
|---|---|---|
| `tipe` | string | `ASET` \| `LIABILITAS` \| `EKUITAS` \| `PENDAPATAN` \| `BEBAN` |
| `aktif` | boolean | `true` \| `false` |
| `indukId` | UUID | `uuid` |

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data akun",
  "data": [
    {
      "id": "uuid",
      "kode": "1101",
      "nama": "Kas Sekolah",
      "tipe": "ASET",
      "saldoNormal": "DEBIT",
      "indukId": "uuid-induk",
      "adalahInduk": false,
      "aktif": true,
      "dibuatPada": "2025-01-01T00:00:00.000Z",
      "diperbaruiPada": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /akun/:id` — Ambil Detail Akun

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil detail akun",
  "data": {
    "id": "uuid",
    "kode": "1101",
    "nama": "Kas Sekolah",
    "tipe": "ASET",
    "saldoNormal": "DEBIT",
    "indukId": "uuid-induk",
    "adalahInduk": false,
    "aktif": true
  }
}
```

**Response `404`:**
```json
{
  "success": false,
  "message": "Akun tidak ditemukan"
}
```

---

#### `POST /akun` — Buat Akun Baru

**Request Body:**
```json
{
  "kode": "1101",
  "nama": "Kas Sekolah",
  "tipe": "ASET",
  "saldoNormal": "DEBIT",
  "indukId": "uuid-akun-induk",
  "adalahInduk": false,
  "aktif": true
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Akun berhasil dibuat",
  "data": { ... }
}
```

**Response `409` — kode duplikat:**
```json
{
  "success": false,
  "message": "Kode akun \"1101\" sudah digunakan"
}
```

**Response `400` — induk bukan akun induk:**
```json
{
  "success": false,
  "message": "Akun yang dipilih sebagai induk bukan merupakan akun induk"
}
```

---

#### `PUT /akun/:id` — Update Akun

**Request Body:** sama seperti `POST /akun`, semua field opsional.

**Response `200`:**
```json
{
  "success": true,
  "message": "Akun berhasil diperbarui",
  "data": { ... }
}
```

---

#### `DELETE /akun/:id` — Hapus Akun

**Response `200`:**
```json
{
  "success": true,
  "message": "Akun berhasil dihapus",
  "data": null
}
```

**Response `400` — masih punya akun anak:**
```json
{
  "success": false,
  "message": "Akun tidak bisa dihapus karena masih memiliki akun turunan"
}
```

**Response `400` — sudah dipakai di jurnal:**
```json
{
  "success": false,
  "message": "Akun tidak bisa dihapus karena sudah digunakan dalam transaksi jurnal"
}
```

---

### 4.2 Periode Fiskal

#### `GET /periode` — Ambil Semua Periode

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data periode fiskal",
  "data": [
    {
      "id": "uuid",
      "bulan": 1,
      "tahun": 2025,
      "sudahDitutup": false,
      "ditutupPada": null
    }
  ]
}
```

---

#### `GET /periode/:id` — Ambil Detail Periode

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil detail periode fiskal",
  "data": {
    "id": "uuid",
    "bulan": 1,
    "tahun": 2025,
    "sudahDitutup": false,
    "ditutupPada": null
  }
}
```

---

#### `POST /periode` — Buat Periode Baru

**Request Body:**
```json
{
  "bulan": 1,
  "tahun": 2025
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Periode fiskal berhasil dibuat",
  "data": { ... }
}
```

**Response `409` — periode duplikat:**
```json
{
  "success": false,
  "message": "Periode 1/2025 sudah ada"
}
```

---

#### `PATCH /periode/:id/tutup` — Tutup Periode

Tidak memerlukan request body.

**Response `200`:**
```json
{
  "success": true,
  "message": "Periode fiskal berhasil ditutup",
  "data": {
    "id": "uuid",
    "bulan": 1,
    "tahun": 2025,
    "sudahDitutup": true,
    "ditutupPada": "2025-02-01T00:00:00.000Z"
  }
}
```

**Response `400` — sudah ditutup:**
```json
{
  "success": false,
  "message": "Periode ini sudah ditutup sebelumnya"
}
```

---

### 4.3 Jurnal

#### `GET /jurnal` — Ambil Semua Jurnal

**Query Params (opsional):**

| Param | Tipe | Contoh |
|---|---|---|
| `status` | string | `DRAF` \| `DIPOSTING` \| `DIBATALKAN` |
| `periodeId` | UUID | `uuid` |
| `dari` | date | `2025-01-01` |
| `sampai` | date | `2025-01-31` |

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data jurnal",
  "data": [
    {
      "id": "uuid",
      "nomor": "JRN-2025-001",
      "tanggal": "2025-01-02",
      "periodeId": "uuid",
      "keterangan": "Penerimaan dana BOS",
      "referensi": "BKM-001",
      "status": "DIPOSTING",
      "alasanBatal": null
    }
  ]
}
```

---

#### `GET /jurnal/:id` — Ambil Detail Jurnal

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil detail jurnal",
  "data": {
    "id": "uuid",
    "nomor": "JRN-2025-001",
    "tanggal": "2025-01-02",
    "status": "DIPOSTING",
    "baris": [
      {
        "id": "uuid",
        "akunId": "uuid",
        "kodeAkun": "1102",
        "namaAkun": "Kas BOS",
        "debit": "45000000.00",
        "kredit": "0.00",
        "keterangan": "Dana BOS masuk"
      },
      {
        "id": "uuid",
        "akunId": "uuid",
        "kodeAkun": "4201",
        "namaAkun": "Pendapatan Dana BOS",
        "debit": "0.00",
        "kredit": "45000000.00",
        "keterangan": "Pendapatan BOS triwulan I"
      }
    ]
  }
}
```

---

#### `POST /jurnal` — Buat Jurnal Baru

**Request Body:**
```json
{
  "tanggal": "2025-01-02",
  "periodeId": "uuid-periode",
  "keterangan": "Penerimaan dana BOS triwulan I",
  "referensi": "BKM-001",
  "baris": [
    {
      "akunId": "uuid-kas-bos",
      "debit": 45000000,
      "kredit": 0,
      "keterangan": "Dana BOS masuk"
    },
    {
      "akunId": "uuid-pendapatan-bos",
      "debit": 0,
      "kredit": 45000000,
      "keterangan": "Pendapatan BOS triwulan I"
    }
  ]
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Jurnal berhasil dibuat",
  "data": { ... }
}
```

**Response `400` — debit ≠ kredit:**
```json
{
  "success": false,
  "message": "Data jurnal tidak valid",
  "errors": {
    "_errors": ["Total debit harus sama dengan total kredit"]
  }
}
```

**Response `400` — pakai akun induk:**
```json
{
  "success": false,
  "message": "Akun induk tidak bisa dipakai di baris jurnal: 1000 - ASET"
}
```

---

#### `PUT /jurnal/:id` — Edit Jurnal

Hanya bisa dilakukan pada jurnal berstatus **DRAF**. Request body sama seperti `POST /jurnal`.

**Response `400` — sudah diposting:**
```json
{
  "success": false,
  "message": "Jurnal hanya bisa diubah jika masih berstatus DRAF"
}
```

---

#### `PATCH /jurnal/:id/posting` — Posting Jurnal

Tidak memerlukan request body. Mengubah status dari `DRAF` menjadi `DIPOSTING`.

**Response `200`:**
```json
{
  "success": true,
  "message": "Jurnal berhasil diposting",
  "data": {
    "id": "uuid",
    "nomor": "JRN-2025-001",
    "status": "DIPOSTING"
  }
}
```

---

#### `PATCH /jurnal/:id/batal` — Batalkan Jurnal

**Request Body:**
```json
{
  "alasanBatal": "Transaksi salah input"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Jurnal berhasil dibatalkan",
  "data": {
    "id": "uuid",
    "status": "DIBATALKAN",
    "alasanBatal": "Transaksi salah input"
  }
}
```

**Response `400` — sudah dibatalkan:**
```json
{
  "success": false,
  "message": "Jurnal ini sudah dibatalkan sebelumnya"
}
```

---

#### `DELETE /jurnal/:id` — Hapus Jurnal

Hanya bisa dilakukan pada jurnal berstatus **DRAF**.

**Response `200`:**
```json
{
  "success": true,
  "message": "Jurnal berhasil dihapus",
  "data": null
}
```

---

### 4.4 Laporan

#### `GET /laporan/buku-besar` — Buku Besar

**Query Params (wajib):**

| Param | Tipe | Keterangan |
|---|---|---|
| `akunId` | UUID | ID akun yang ingin dilihat (harus akun detail) |
| `dari` | date | Tanggal awal periode |
| `sampai` | date | Tanggal akhir periode |

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil laporan buku besar",
  "data": {
    "akun": {
      "id": "uuid",
      "kode": "1102",
      "nama": "Kas BOS",
      "tipe": "ASET",
      "saldoNormal": "DEBIT"
    },
    "periode": {
      "dari": "2025-01-01",
      "sampai": "2025-01-31"
    },
    "saldoAwal": 0,
    "baris": [
      {
        "tanggal": "2025-01-02",
        "nomorJurnal": "JRN-2025-001",
        "keterangan": "Penerimaan dana BOS",
        "referensi": "BKM-001",
        "debit": 45000000,
        "kredit": 0,
        "saldo": 45000000
      },
      {
        "tanggal": "2025-01-15",
        "nomorJurnal": "JRN-2025-003",
        "keterangan": "Pembelian ATK dari dana BOS",
        "referensi": "BKK-003",
        "debit": 0,
        "kredit": 2500000,
        "saldo": 42500000
      }
    ],
    "totalDebit": 45000000,
    "totalKredit": 2500000,
    "saldoAkhir": 42500000
  }
}
```

---

#### `GET /laporan/laba-rugi` — Laba Rugi

**Query Params (wajib):**

| Param | Tipe | Keterangan |
|---|---|---|
| `dari` | date | Tanggal awal periode |
| `sampai` | date | Tanggal akhir periode |

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil laporan laba rugi",
  "data": {
    "periode": {
      "dari": "2025-01-01",
      "sampai": "2025-01-31"
    },
    "pendapatan": {
      "baris": [
        { "kode": "4101", "nama": "Pendapatan SPP", "jumlah": 12000000 },
        { "kode": "4201", "nama": "Pendapatan Dana BOS", "jumlah": 45000000 }
      ],
      "total": 57000000
    },
    "beban": {
      "baris": [
        { "kode": "5101", "nama": "Beban Gaji Guru", "jumlah": 18000000 },
        { "kode": "5102", "nama": "Beban Gaji Staf TU", "jumlah": 4000000 },
        { "kode": "5202", "nama": "Beban ATK", "jumlah": 2500000 }
      ],
      "total": 24500000
    },
    "labaRugiBersih": 32500000,
    "status": "LABA"
  }
}
```

---

#### `GET /laporan/neraca` — Neraca

**Query Params (wajib):**

| Param | Tipe | Keterangan |
|---|---|---|
| `sampai` | date | Tanggal neraca dihitung (akumulatif hingga tanggal ini) |

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil laporan neraca",
  "data": {
    "tanggal": "2025-01-31",
    "aset": {
      "baris": [
        { "kode": "1101", "nama": "Kas Sekolah", "saldo": 6200000 },
        { "kode": "1102", "nama": "Kas BOS", "saldo": 42500000 },
        { "kode": "1104", "nama": "Bank Sekolah", "saldo": 15000000 }
      ],
      "total": 63700000
    },
    "liabilitas": {
      "baris": [],
      "total": 0
    },
    "ekuitas": {
      "baris": [],
      "labaRugiBerjalan": 32500000,
      "total": 32500000
    },
    "totalLiabilitasDanEkuitas": 32500000,
    "seimbang": false
  }
}
```

> **Catatan:** Field `seimbang` bernilai `true` jika total aset sama dengan total liabilitas + ekuitas. Nilai `false` menandakan ada ketidakseimbangan yang perlu diperiksa.

---

#### `GET /laporan/arus-kas` — Arus Kas

**Query Params (wajib):**

| Param | Tipe | Keterangan |
|---|---|---|
| `dari` | date | Tanggal awal periode |
| `sampai` | date | Tanggal akhir periode |

**Response `200`:**
```json
{
  "success": true,
  "message": "Berhasil mengambil laporan arus kas",
  "data": {
    "periode": {
      "dari": "2025-01-01",
      "sampai": "2025-01-31"
    },
    "saldoAwal": 0,
    "baris": [
      {
        "tanggal": "2025-01-02",
        "nomorJurnal": "JRN-2025-001",
        "keterangan": "Penerimaan dana BOS",
        "referensi": "BKM-001",
        "namaAkun": "Kas BOS",
        "kasMasuk": 45000000,
        "kasKeluar": 0
      },
      {
        "tanggal": "2025-01-10",
        "nomorJurnal": "JRN-2025-002",
        "keterangan": "Penerimaan SPP Januari",
        "referensi": "BKM-002",
        "namaAkun": "Kas Sekolah",
        "kasMasuk": 12000000,
        "kasKeluar": 0
      },
      {
        "tanggal": "2025-01-15",
        "nomorJurnal": "JRN-2025-003",
        "keterangan": "Pembelian ATK dari dana BOS",
        "referensi": "BKK-003",
        "namaAkun": "Kas BOS",
        "kasMasuk": 0,
        "kasKeluar": 2500000
      }
    ],
    "totalKasMasuk": 57000000,
    "totalKasKeluar": 24300000,
    "netArusKas": 32700000,
    "saldoAkhir": 32700000,
    "ringkasanPerAkun": [
      {
        "kode": "1101",
        "nama": "Kas Sekolah",
        "kasMasuk": 12000000,
        "kasKeluar": 5800000,
        "net": 6200000
      },
      {
        "kode": "1102",
        "nama": "Kas BOS",
        "kasMasuk": 45000000,
        "kasKeluar": 2500000,
        "net": 42500000
      }
    ]
  }
}
```
