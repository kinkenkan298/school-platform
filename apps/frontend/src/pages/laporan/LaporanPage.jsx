import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Tabs from "../../components/ui/Tabs.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { LaporanAPI } from "../../api/laporan.api.js";
import { AkunAPI } from "../../api/akun.api.js";
import { formatDate, formatIDR } from "../../utils/format.js";

export default function LaporanPage() {
  const [tab, setTab] = useState("buku-besar");

  const tabs = [
    { key: "buku-besar", label: "Buku Besar" },
    { key: "laba-rugi", label: "Laba Rugi" },
    { key: "neraca", label: "Neraca" },
    { key: "arus-kas", label: "Arus Kas" },
  ];

  const [akun, setAkun] = useState([]);

  useEffect(() => {
    AkunAPI.listAll()
      .then((r) => setAkun(r.data || []))
      .catch(() => {});
  }, []);

  const akunDetailOptions = useMemo(
    () => (akun || []).filter((a) => a.aktif && !a.adalahInduk),
    [akun]
  );

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan Keuangan</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pilih tab di bawah ini untuk melihat berbagai ringkasan dan analisis keuangan sekolah.
        </p>
      </Card>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl px-2 pt-2">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div className="mt-6">
        {tab === "buku-besar" ? <BukuBesar akunOptions={akunDetailOptions} /> : null}
        {tab === "laba-rugi" ? <LabaRugi /> : null}
        {tab === "neraca" ? <Neraca /> : null}
        {tab === "arus-kas" ? <ArusKas /> : null}
      </div>
    </div>
  );
}

// ==========================================
// 1. BUKU BESAR
// ==========================================
function BukuBesar({ akunOptions }) {
  const [akunId, setAkunId] = useState("");
  const [dari, setDari] = useState("2025-01-01");
  const [sampai, setSampai] = useState("2025-01-31");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await LaporanAPI.bukuBesar({ akunId, dari, sampai });
      setData(res.data);
    } catch (e) {
      setError(e.message || "Gagal mengambil laporan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <div className="grid gap-4 sm:grid-cols-4 items-end">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold text-slate-600 mb-2">Pilih Akun</p>
            <Select value={akunId} onChange={(e) => setAkunId(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white text-slate-800">
              <option value="">-- Pilih akun detail --</option>
              {akunOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.kode} - {a.nama}</option>
              ))}
            </Select>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Dari Tanggal</p>
            <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Sampai Tanggal</p>
            <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="primary" onClick={run} disabled={!akunId || !dari || !sampai || loading} className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-6 !py-2 !rounded-lg font-semibold shadow-md border-none">
            {loading ? "Memuat..." : "Tampilkan Laporan"}
          </Button>
          <Button onClick={() => { setDari("2025-01-01"); setSampai("2025-01-31"); }} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !px-4 !py-2 !rounded-lg font-medium">
            Reset Tanggal
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="p-10 text-center"><Spinner label="Mengambil buku besar..." /></div>
      ) : error ? (
        <div className="p-5 text-center bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border border-blue-100 shadow-sm rounded-xl p-5">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Informasi Akun</p>
              <p className="text-lg text-slate-800 font-semibold">
                <span className="font-mono bg-white px-2 py-1 rounded text-blue-700 mr-2 border border-blue-200">{data.akun?.kode}</span> 
                {data.akun?.nama}
              </p>
              <p className="mt-2 text-sm text-slate-600 font-medium">
                Periode: {formatDate(data.periode?.dari)} s/d {formatDate(data.periode?.sampai)}
              </p>
            </Card>
            
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Saldo Awal</p>
              <p className="text-2xl font-bold text-slate-800">{formatIDR(data.saldoAwal)}</p>
            </Card>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-4 text-sm font-bold text-slate-700">Tanggal</th>
                  <th className="px-5 py-4 text-sm font-bold text-slate-700">Nomor Jurnal</th>
                  <th className="px-5 py-4 text-sm font-bold text-slate-700">Keterangan</th>
                  <th className="px-5 py-4 text-sm font-bold text-slate-700">Referensi</th>
                  <th className="px-5 py-4 text-sm font-bold text-slate-700 text-right">Debit</th>
                  <th className="px-5 py-4 text-sm font-bold text-slate-700 text-right">Kredit</th>
                  <th className="px-5 py-4 text-sm font-bold text-slate-700 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.baris || []).map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-800">{formatDate(b.tanggal)}</td>
                    <td className="px-5 py-3 font-mono text-slate-600">{b.nomorJurnal}</td>
                    <td className="px-5 py-3 text-slate-800">{b.keterangan || "-"}</td>
                    <td className="px-5 py-3 text-slate-500">{b.referensi || "-"}</td>
                    <td className="px-5 py-3 text-right text-slate-800">{formatIDR(b.debit)}</td>
                    <td className="px-5 py-3 text-right text-slate-800">{formatIDR(b.kredit)}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-800 bg-slate-50/50">{formatIDR(b.saldo)}</td>
                  </tr>
                ))}
                {(!data.baris || data.baris.length === 0) && (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-500">Tidak ada transaksi pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Card className="bg-slate-800 border-none shadow-md rounded-xl p-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Mutasi Debit</p>
                <p className="text-lg font-semibold">{formatIDR(data.totalDebit)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Mutasi Kredit</p>
                <p className="text-lg font-semibold">{formatIDR(data.totalKredit)}</p>
              </div>
              <div className="text-right pl-6 border-l border-slate-600">
                <p className="text-slate-300 text-sm font-medium mb-1">Saldo Akhir</p>
                <p className="text-2xl font-bold text-emerald-400">{formatIDR(data.saldoAkhir)}</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

// ==========================================
// 2. LABA RUGI
// ==========================================
function LabaRugi() {
  const [dari, setDari] = useState("2025-01-01");
  const [sampai, setSampai] = useState("2025-01-31");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await LaporanAPI.labaRugi({ dari, sampai });
      setData(res.data);
    } catch (e) {
      setError(e.message || "Gagal mengambil laporan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Dari Tanggal</p>
            <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Sampai Tanggal</p>
            <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm" />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="primary" onClick={run} disabled={!dari || !sampai || loading} className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-6 !py-2 !rounded-lg font-semibold shadow-md border-none">
              {loading ? "Memuat..." : "Tampilkan Laporan"}
            </Button>
            <Button onClick={() => { setDari("2025-01-01"); setSampai("2025-01-31"); }} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !px-4 !py-2 !rounded-lg font-medium">
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="p-10 text-center"><Spinner label="Mengambil laporan Laba Rugi..." /></div>
      ) : error ? (
        <div className="p-5 text-center bg-red-50 border border-red-200 rounded-xl"><p className="text-sm font-medium text-red-600">{error}</p></div>
      ) : data ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 text-center">
            <h3 className="text-xl font-bold text-slate-800">Laporan Laba Rugi</h3>
            <p className="text-slate-500 font-medium mt-1">Periode: {formatDate(data.periode?.dari)} s/d {formatDate(data.periode?.sampai)}</p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* PENDAPATAN */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-0 overflow-hidden flex flex-col">
              <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-100">
                <p className="font-bold text-emerald-800 text-lg">Pendapatan</p>
              </div>
              <div className="p-5 flex-1 space-y-3">
                {(data.pendapatan?.baris || []).map((b, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700 font-medium">
                      <span className="font-mono text-slate-400 mr-2 text-sm">{b.kode}</span>{b.nama}
                    </span>
                    <span className="text-slate-800 font-semibold">{formatIDR(b.jumlah)}</span>
                  </div>
                ))}
                {(!data.pendapatan?.baris || data.pendapatan.baris.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">Tidak ada data pendapatan</p>
                )}
              </div>
              <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex justify-between items-center">
                <p className="font-bold text-slate-600">Total Pendapatan</p>
                <p className="font-bold text-emerald-600 text-lg">{formatIDR(data.pendapatan?.total)}</p>
              </div>
            </Card>

            {/* BEBAN */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-0 overflow-hidden flex flex-col">
              <div className="bg-orange-50 px-5 py-4 border-b border-orange-100">
                <p className="font-bold text-orange-800 text-lg">Beban / Pengeluaran</p>
              </div>
              <div className="p-5 flex-1 space-y-3">
                {(data.beban?.baris || []).map((b, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700 font-medium">
                      <span className="font-mono text-slate-400 mr-2 text-sm">{b.kode}</span>{b.nama}
                    </span>
                    <span className="text-slate-800 font-semibold">{formatIDR(b.jumlah)}</span>
                  </div>
                ))}
                {(!data.beban?.baris || data.beban.baris.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">Tidak ada data beban</p>
                )}
              </div>
              <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex justify-between items-center">
                <p className="font-bold text-slate-600">Total Beban</p>
                <p className="font-bold text-orange-600 text-lg">{formatIDR(data.beban?.total)}</p>
              </div>
            </Card>
          </div>

          <Card className={`border-none shadow-md rounded-xl p-6 text-white ${data.labaRugiBersih >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-white/80 font-medium mb-1 uppercase tracking-wider text-sm">Laba / Rugi Bersih</p>
                <p className="text-3xl font-bold">{formatIDR(data.labaRugiBersih)}</p>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <span className="font-bold uppercase tracking-widest text-lg">{data.status}</span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

// ==========================================
// 3. NERACA
// ==========================================
function Neraca() {
  const [sampai, setSampai] = useState("2025-01-31");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await LaporanAPI.neraca({ sampai });
      setData(res.data);
    } catch (e) {
      setError(e.message || "Gagal mengambil laporan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Posisi per Tanggal</p>
            <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm" />
          </div>
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button variant="primary" onClick={run} disabled={!sampai || loading} className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-6 !py-2 !rounded-lg font-semibold shadow-md border-none">
              {loading ? "Memuat..." : "Tampilkan Laporan"}
            </Button>
            <Button onClick={() => setSampai("2025-01-31")} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !px-4 !py-2 !rounded-lg font-medium">
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="p-10 text-center"><Spinner label="Mengambil laporan Neraca..." /></div>
      ) : error ? (
        <div className="p-5 text-center bg-red-50 border border-red-200 rounded-xl"><p className="text-sm font-medium text-red-600">{error}</p></div>
      ) : data ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-wrap justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Laporan Neraca (Posisi Keuangan)</h3>
              <p className="text-slate-500 font-medium mt-1">Per Tanggal: {formatDate(data.tanggal)}</p>
            </div>
            <div className="mt-2 sm:mt-0 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-semibold text-slate-600 mr-3">Status Keseimbangan:</span>
              {data.seimbang ? <Badge tone="ok" className="!bg-green-100 !text-green-700 px-3">SEIMBANG</Badge> : <Badge tone="err" className="!bg-red-100 !text-red-700 px-3">TIDAK SEIMBANG</Badge>}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* BAGIAN KIRI: ASET */}
            <div className="space-y-4">
              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-0 overflow-hidden">
                <div className="bg-blue-50 px-5 py-4 border-b border-blue-100">
                  <p className="font-bold text-blue-800 text-lg">Aset (Harta)</p>
                </div>
                <div className="p-5 space-y-2">
                  {(data.aset?.baris || []).map((b, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-700 font-medium"><span className="font-mono text-slate-400 mr-2 text-sm">{b.kode}</span>{b.nama}</span>
                      <span className="text-slate-800 font-semibold">{formatIDR(b.saldo)}</span>
                    </div>
                  ))}
                  {(!data.aset?.baris || data.aset.baris.length === 0) && <p className="text-sm text-slate-400 text-center py-2">Tidak ada data</p>}
                </div>
                <div className="bg-blue-600 px-5 py-4 text-white flex justify-between items-center">
                  <p className="font-bold text-white/90 uppercase tracking-wider text-sm">Total Aset</p>
                  <p className="font-bold text-xl">{formatIDR(data.aset?.total)}</p>
                </div>
              </Card>
            </div>

            {/* BAGIAN KANAN: LIABILITAS & EKUITAS */}
            <div className="space-y-4">
              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-0 overflow-hidden">
                <div className="bg-orange-50 px-5 py-3 border-b border-orange-100">
                  <p className="font-bold text-orange-800 text-lg">Liabilitas (Kewajiban / Hutang)</p>
                </div>
                <div className="p-4 space-y-1">
                  {(data.liabilitas?.baris || []).map((b, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-700 font-medium"><span className="font-mono text-slate-400 mr-2 text-sm">{b.kode}</span>{b.nama}</span>
                      <span className="text-slate-800 font-semibold">{formatIDR(b.saldo)}</span>
                    </div>
                  ))}
                  {(!data.liabilitas?.baris || data.liabilitas.baris.length === 0) && <p className="text-sm text-slate-400 text-center py-2">Tidak ada data</p>}
                </div>
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
                  <p className="font-bold text-slate-600">Total Liabilitas</p>
                  <p className="font-bold text-slate-800">{formatIDR(data.liabilitas?.total)}</p>
                </div>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-0 overflow-hidden">
                <div className="bg-purple-50 px-5 py-3 border-b border-purple-100">
                  <p className="font-bold text-purple-800 text-lg">Ekuitas (Modal)</p>
                </div>
                <div className="p-4 space-y-1">
                  {(data.ekuitas?.baris || []).map((b, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-700 font-medium"><span className="font-mono text-slate-400 mr-2 text-sm">{b.kode}</span>{b.nama}</span>
                      <span className="text-slate-800 font-semibold">{formatIDR(b.saldo)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 mt-2 pt-2 border-t border-dashed border-slate-300">
                    <span className="text-slate-600 font-medium italic">Laba/Rugi Berjalan</span>
                    <span className="text-slate-800 font-semibold italic">{formatIDR(data.ekuitas?.labaRugiBerjalan)}</span>
                  </div>
                </div>
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
                  <p className="font-bold text-slate-600">Total Ekuitas</p>
                  <p className="font-bold text-slate-800">{formatIDR(data.ekuitas?.total)}</p>
                </div>
              </Card>

              <Card className={`border-none shadow-md rounded-xl p-5 text-white ${data.seimbang ? 'bg-blue-600' : 'bg-red-600'}`}>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-white/90 uppercase tracking-wider text-sm">Total Liabilitas + Ekuitas</p>
                  <p className="font-bold text-xl">{formatIDR(data.totalLiabilitasDanEkuitas)}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ==========================================
// 4. ARUS KAS
// ==========================================
function ArusKas() {
  const [dari, setDari] = useState("2025-01-01");
  const [sampai, setSampai] = useState("2025-12-31");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await LaporanAPI.arusKas({ dari, sampai });
      setData(res.data);
    } catch (e) {
      setError(e.message || "Gagal mengambil laporan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Dari Tanggal</p>
            <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Sampai Tanggal</p>
            <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm" />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="primary" onClick={run} disabled={!dari || !sampai || loading} className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-6 !py-2 !rounded-lg font-semibold shadow-md border-none">
              {loading ? "Memuat..." : "Tampilkan Laporan"}
            </Button>
            <Button onClick={() => { setDari("2025-01-01"); setSampai("2025-12-31"); }} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !px-4 !py-2 !rounded-lg font-medium">
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="p-10 text-center"><Spinner label="Mengambil laporan Arus Kas..." /></div>
      ) : error ? (
        <div className="p-5 text-center bg-red-50 border border-red-200 rounded-xl"><p className="text-sm font-medium text-red-600">{error}</p></div>
      ) : data ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 text-center">
            <h3 className="text-xl font-bold text-slate-800">Laporan Arus Kas</h3>
            <p className="text-slate-500 font-medium mt-1">Periode: {formatDate(data.periode?.dari)} s/d {formatDate(data.periode?.sampai)}</p>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Saldo Awal</p>
              <p className="text-lg font-bold text-slate-800">{formatIDR(data.saldoAwal)}</p>
            </Card>
            <Card className="bg-emerald-50 border border-emerald-100 shadow-sm rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Masuk</p>
              <p className="text-lg font-bold text-emerald-700">+{formatIDR(data.totalKasMasuk)}</p>
            </Card>
            <Card className="bg-orange-50 border border-orange-100 shadow-sm rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Total Keluar</p>
              <p className="text-lg font-bold text-orange-700">-{formatIDR(data.totalKasKeluar)}</p>
            </Card>
            <Card className="bg-blue-600 border-none shadow-md rounded-xl p-4 text-center text-white">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Saldo Akhir</p>
              <p className="text-xl font-bold">{formatIDR(data.saldoAkhir)}</p>
            </Card>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-x-auto">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-700">Rincian Transaksi Kas</h4>
            </div>
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-5 py-3 text-sm font-bold text-slate-600">Tanggal</th>
                  <th className="px-5 py-3 text-sm font-bold text-slate-600">Nomor</th>
                  <th className="px-5 py-3 text-sm font-bold text-slate-600">Keterangan</th>
                  <th className="px-5 py-3 text-sm font-bold text-slate-600">Akun Kas</th>
                  <th className="px-5 py-3 text-sm font-bold text-slate-600 text-right">Kas Masuk</th>
                  <th className="px-5 py-3 text-sm font-bold text-slate-600 text-right">Kas Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.baris || []).map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-800">{formatDate(b.tanggal)}</td>
                    <td className="px-5 py-3 font-mono text-slate-500 text-sm">{b.nomorJurnal}</td>
                    <td className="px-5 py-3 text-slate-800">{b.keterangan}</td>
                    <td className="px-5 py-3 text-blue-600 font-medium">{b.namaAkun}</td>
                    <td className="px-5 py-3 text-right font-medium text-emerald-600">{b.kasMasuk > 0 ? formatIDR(b.kasMasuk) : "-"}</td>
                    <td className="px-5 py-3 text-right font-medium text-orange-600">{b.kasKeluar > 0 ? formatIDR(b.kasKeluar) : "-"}</td>
                  </tr>
                ))}
                {(!data.baris || data.baris.length === 0) && (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500">Tidak ada pergerakan kas pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-0 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h4 className="font-bold text-slate-700">Ringkasan Pergerakan per Akun Kas</h4>
            </div>
            <div className="p-5 space-y-3">
              {(data.ringkasanPerAkun || []).map((r, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-800 font-medium">
                    <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 mr-2 text-sm">{r.kode}</span>
                    {r.nama}
                  </span>
                  <div className="flex gap-4 text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Masuk: <span className="font-semibold text-emerald-600">{formatIDR(r.kasMasuk)}</span></span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">Keluar: <span className="font-semibold text-orange-600">{formatIDR(r.kasKeluar)}</span></span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600 font-medium">Net: <span className={`font-bold ${r.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatIDR(r.net)}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}