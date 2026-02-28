import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Tabs from "../../components/ui/Tabs.jsx";
import Table, { TBody, TD, TH, THead } from "../../components/ui/Table.jsx";
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
    AkunAPI.list()
      .then((r) => setAkun(r.data || []))
      .catch(() => {});
  }, []);

  const akunDetailOptions = useMemo(() => akun.filter((a) => a.aktif && !a.adalahInduk), [akun]);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-semibold">laporan</h2>
        <p className="mt-1 text-sm text-slate-400">
          Semua laporan hanya menghitung jurnal <span className="text-slate-200">DIPOSTING</span>.
        </p>
      </Card>

      <Card>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </Card>

      {tab === "buku-besar" ? <BukuBesar akunOptions={akunDetailOptions} /> : null}
      {tab === "laba-rugi" ? <LabaRugi /> : null}
      {tab === "neraca" ? <Neraca /> : null}
      {tab === "arus-kas" ? <ArusKas /> : null}
    </div>
  );
}

function BukuBesar({ akunOptions }) {
  const [akunId, setAkunId] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

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
    <Card>
      <h3 className="font-semibold">Buku Besar</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="text-xs text-slate-400">Akun</p>
          <Select value={akunId} onChange={(e) => setAkunId(e.target.value)}>
            <option value="">Pilih akun detail</option>
            {akunOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.kode} - {a.nama}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <p className="text-xs text-slate-400">Dari</p>
          <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
        </div>
        <div>
          <p className="text-xs text-slate-400">Sampai</p>
          <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
        </div>
      </div>

      <div className="mt-3">
        <Button variant="primary" onClick={run} disabled={!akunId || !dari || !sampai || loading}>
          {loading ? "Memuat..." : "Tampilkan"}
        </Button>
      </div>

      {loading ? (
        <div className="mt-4">
          <Spinner label="Mengambil buku besar..." />
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : data ? (
        <div className="mt-4 space-y-3">
          <Card>
            <p className="text-sm text-slate-300">
              Akun: <span className="font-mono text-slate-200">{data.akun?.kode}</span> —{" "}
              <span className="text-slate-200">{data.akun?.nama}</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Periode: {data.periode?.dari} s/d {data.periode?.sampai}
            </p>
            <p className="mt-2 text-sm">
              Saldo Awal: <span className="font-semibold">{formatIDR(data.saldoAwal)}</span>
            </p>
          </Card>

          <Table>
            <THead>
              <TH>Tanggal</TH>
              <TH>Nomor</TH>
              <TH>Keterangan</TH>
              <TH>Referensi</TH>
              <TH className="text-right">Debit</TH>
              <TH className="text-right">Kredit</TH>
              <TH className="text-right">Saldo</TH>
            </THead>
            <TBody>
              {(data.baris || []).map((b, i) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  <TD>{formatDate(b.tanggal)}</TD>
                  <TD className="font-mono">{b.nomorJurnal}</TD>
                  <TD>{b.keterangan}</TD>
                  <TD className="text-slate-300">{b.referensi || "-"}</TD>
                  <TD className="text-right">{formatIDR(b.debit)}</TD>
                  <TD className="text-right">{formatIDR(b.kredit)}</TD>
                  <TD className="text-right">{formatIDR(b.saldo)}</TD>
                </tr>
              ))}
            </TBody>
          </Table>

          <Card>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                Total Debit: <b>{formatIDR(data.totalDebit)}</b>
              </div>
              <div>
                Total Kredit: <b>{formatIDR(data.totalKredit)}</b>
              </div>
              <div>
                Saldo Akhir: <b>{formatIDR(data.saldoAkhir)}</b>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </Card>
  );
}

function LabaRugi() {
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

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
    <Card>
      <h3 className="font-semibold">Laba Rugi</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-400">Dari</p>
          <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
        </div>
        <div>
          <p className="text-xs text-slate-400">Sampai</p>
          <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="primary" onClick={run} disabled={!dari || !sampai || loading}>
            {loading ? "Memuat..." : "Tampilkan"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-4">
          <Spinner label="Mengambil laba rugi..." />
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : data ? (
        <div className="mt-4 space-y-4">
          <Card>
            <p className="text-sm text-slate-400">
              Periode: {data.periode?.dari} s/d {data.periode?.sampai}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <span>
                Pendapatan: <b>{formatIDR(data.pendapatan?.total)}</b>
              </span>
              <span>
                Beban: <b>{formatIDR(data.beban?.total)}</b>
              </span>
              <span>
                Laba/Rugi Bersih: <b>{formatIDR(data.labaRugiBersih)}</b>{" "}
                <Badge className="ml-2">{data.status}</Badge>
              </span>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="font-semibold">Pendapatan</p>
              <div className="mt-2 space-y-1 text-sm">
                {(data.pendapatan?.baris || []).map((b, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="text-slate-200">
                      <span className="font-mono">{b.kode}</span> — {b.nama}
                    </span>
                    <span className="text-slate-100">{formatIDR(b.jumlah)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="font-semibold">Beban</p>
              <div className="mt-2 space-y-1 text-sm">
                {(data.beban?.baris || []).map((b, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="text-slate-200">
                      <span className="font-mono">{b.kode}</span> — {b.nama}
                    </span>
                    <span className="text-slate-100">{formatIDR(b.jumlah)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function Neraca() {
  const [sampai, setSampai] = useState("");

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
    <Card>
      <h3 className="font-semibold">Neraca</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-400">Sampai</p>
          <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="primary" onClick={run} disabled={!sampai || loading}>
            {loading ? "Memuat..." : "Tampilkan"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-4">
          <Spinner label="Mengambil neraca..." />
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : data ? (
        <div className="mt-4 space-y-4">
          <Card>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span>
                Tanggal: <b>{data.tanggal}</b>
              </span>
              <span>
                Seimbang:{" "}
                {data.seimbang ? <Badge tone="ok">true</Badge> : <Badge tone="err">false</Badge>}
              </span>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="font-semibold">Aset</p>
              <div className="mt-2 space-y-1 text-sm">
                {(data.aset?.baris || []).map((b, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="text-slate-200">
                      <span className="font-mono">{b.kode}</span> — {b.nama}
                    </span>
                    <span>{formatIDR(b.saldo)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm">
                Total: <b>{formatIDR(data.aset?.total)}</b>
              </p>
            </Card>

            <Card>
              <p className="font-semibold">Liabilitas</p>
              <div className="mt-2 space-y-1 text-sm">
                {(data.liabilitas?.baris || []).map((b, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="text-slate-200">
                      <span className="font-mono">{b.kode}</span> — {b.nama}
                    </span>
                    <span>{formatIDR(b.saldo)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm">
                Total: <b>{formatIDR(data.liabilitas?.total)}</b>
              </p>
            </Card>

            <Card>
              <p className="font-semibold">Ekuitas</p>
              <div className="mt-2 space-y-1 text-sm">
                {(data.ekuitas?.baris || []).map((b, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="text-slate-200">
                      <span className="font-mono">{b.kode}</span> — {b.nama}
                    </span>
                    <span>{formatIDR(b.saldo)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm">
                Laba/Rugi berjalan: <b>{formatIDR(data.ekuitas?.labaRugiBerjalan)}</b>
              </p>
              <p className="mt-1 text-sm">
                Total: <b>{formatIDR(data.ekuitas?.total)}</b>
              </p>
            </Card>
          </div>

          <Card>
            <p className="text-sm">
              Total Liabilitas + Ekuitas: <b>{formatIDR(data.totalLiabilitasDanEkuitas)}</b>
            </p>
          </Card>
        </div>
      ) : null}
    </Card>
  );
}

function ArusKas() {
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

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
    <Card>
      <h3 className="font-semibold">Arus Kas</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-400">Dari</p>
          <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
        </div>
        <div>
          <p className="text-xs text-slate-400">Sampai</p>
          <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="primary" onClick={run} disabled={!dari || !sampai || loading}>
            {loading ? "Memuat..." : "Tampilkan"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-4">
          <Spinner label="Mengambil arus kas..." />
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : data ? (
        <div className="mt-4 space-y-4">
          <Card>
            <p className="text-sm text-slate-400">
              Periode: {data.periode?.dari} s/d {data.periode?.sampai}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <span>
                Saldo Awal: <b>{formatIDR(data.saldoAwal)}</b>
              </span>
              <span>
                Total Masuk: <b>{formatIDR(data.totalKasMasuk)}</b>
              </span>
              <span>
                Total Keluar: <b>{formatIDR(data.totalKasKeluar)}</b>
              </span>
              <span>
                Net: <b>{formatIDR(data.netArusKas)}</b>
              </span>
              <span>
                Saldo Akhir: <b>{formatIDR(data.saldoAkhir)}</b>
              </span>
            </div>
          </Card>

          <Table>
            <THead>
              <TH>Tanggal</TH>
              <TH>Nomor</TH>
              <TH>Keterangan</TH>
              <TH>Referensi</TH>
              <TH>Akun Kas</TH>
              <TH className="text-right">Kas Masuk</TH>
              <TH className="text-right">Kas Keluar</TH>
            </THead>
            <TBody>
              {(data.baris || []).map((b, i) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  <TD>{formatDate(b.tanggal)}</TD>
                  <TD className="font-mono">{b.nomorJurnal}</TD>
                  <TD>{b.keterangan}</TD>
                  <TD className="text-slate-300">{b.referensi || "-"}</TD>
                  <TD className="text-slate-200">{b.namaAkun}</TD>
                  <TD className="text-right">{formatIDR(b.kasMasuk)}</TD>
                  <TD className="text-right">{formatIDR(b.kasKeluar)}</TD>
                </tr>
              ))}
            </TBody>
          </Table>

          <Card>
            <p className="font-semibold">Ringkasan per akun</p>
            <div className="mt-2 space-y-1 text-sm">
              {(data.ringkasanPerAkun || []).map((r, i) => (
                <div key={i} className="flex flex-wrap justify-between gap-3">
                  <span className="text-slate-200">
                    <span className="font-mono">{r.kode}</span> — {r.nama}
                  </span>
                  <span className="text-slate-300">
                    Masuk: {formatIDR(r.kasMasuk)} • Keluar: {formatIDR(r.kasKeluar)} • Net:{" "}
                    <span className="text-slate-100">{formatIDR(r.net)}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </Card>
  );
}