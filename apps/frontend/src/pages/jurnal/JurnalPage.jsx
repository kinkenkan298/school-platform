import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Textarea from "../../components/ui/Textarea.jsx";

import { JurnalAPI } from "../../api/jurnal.api.js";
import { PeriodeAPI } from "../../api/periode.api.js";
import { AkunAPI } from "../../api/akun.api.js";

import { toNumber } from "../../utils/numbers.js";
import { extractFieldErrors } from "../../utils/errors.js";
import { formatDate, formatIDR } from "../../utils/format.js";

const STATUS = ["DRAF", "DIPOSTING", "DIBATALKAN"];

export default function JurnalPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [periode, setPeriode] = useState([]);
  const [akun, setAkun] = useState([]);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterPeriodeId, setFilterPeriodeId] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formInitial, setFormInitial] = useState(null);

  const [batalOpen, setBatalOpen] = useState(false);
  const [batalId, setBatalId] = useState("");
  const [alasanBatal, setAlasanBatal] = useState("");

  const periodeById = useMemo(() => {
    const map = new Map();
    (periode || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [periode]);

  const akunOptionsForJurnal = useMemo(() => {
    return (akun || []).filter((a) => a.aktif && !a.adalahInduk);
  }, [akun]);

  async function loadMaster() {
    try {
      const [p, a] = await Promise.all([PeriodeAPI.list(), AkunAPI.listAll()]);
      setPeriode(p.data || []);
      setAkun(a.data || []);
    } catch {
      // ignore
    }
  }

  async function loadList() {
    setLoading(true);
    setError("");
    try {
      const res = await JurnalAPI.list({
        status: filterStatus || undefined,
        periodeId: filterPeriodeId || undefined,
        dari: dari || undefined,
        sampai: sampai || undefined,
      });
      setItems(res.data || []);
    } catch (e) {
      setError(e.message || "Gagal memuat jurnal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaster();
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPeriodeId, dari, sampai]);

  function getPeriodeLabel(periodeId) {
    if (!periodeId) return "-";
    const p = periodeById.get(periodeId);
    if (!p) return "—";
    return `${p.bulan}/${p.tahun}${p.sudahDitutup ? " (ditutup)" : ""}`;
  }

  async function openDetail(row) {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);

    try {
      const res = await JurnalAPI.detail(row.id);
      setDetail({ ...row, ...(res.data || {}) });
    } catch (e) {
      setDetail({ error: e.message || "Gagal memuat detail" });
    } finally {
      setDetailLoading(false);
    }
  }

  function openCreate() {
    setFormMode("create");
    setFormInitial(null);
    setFormOpen(true);
  }

  async function openEdit(row) {
    setFormMode("edit");
    setFormInitial(null);
    setFormOpen(true);

    try {
      const res = await JurnalAPI.detail(row.id);
      const merged = {
        ...row,
        ...(res.data || {}),
        baris: res.data?.baris ?? row.baris ?? [],
      };
      setFormInitial(merged);
    } catch (e) {
      alert(e.message || "Gagal mengambil data untuk edit");
      setFormOpen(false);
    }
  }

  async function posting(row) {
    const ok = confirm(`Posting jurnal ${row.nomor}?`);
    if (!ok) return;
    try {
      await JurnalAPI.posting(row.id);
      await loadList();
      alert("Jurnal berhasil diposting");
    } catch (e) {
      alert(e.message || "Gagal posting jurnal");
    }
  }

  function openBatal(row) {
    setBatalId(row.id);
    setAlasanBatal("");
    setBatalOpen(true);
  }

  async function doBatal() {
    if (!alasanBatal.trim()) {
      alert("Alasan batal wajib diisi");
      return;
    }
    try {
      await JurnalAPI.batal(batalId, alasanBatal.trim());
      setBatalOpen(false);
      await loadList();
      alert("Jurnal berhasil dibatalkan");
    } catch (e) {
      alert(e.message || "Gagal membatalkan jurnal");
    }
  }

  async function remove(row) {
    const ok = confirm(`Hapus jurnal ${row.nomor}? (hanya DRAF)`);
    if (!ok) return;
    try {
      await JurnalAPI.remove(row.id);
      await loadList();
      alert("Jurnal berhasil dihapus");
    } catch (e) {
      alert(e.message || "Gagal menghapus jurnal");
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header Card */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Jurnal Umum</h2>
          <p className="mt-1 text-sm text-slate-500">Catat dan kelola transaksi keuangan sekolah.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={loadList} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !shadow-sm !px-4 !py-2 !rounded-lg transition-all font-medium">
            ↻ Refresh
          </Button>
          <Button variant="primary" onClick={openCreate} className="!bg-blue-600 hover:!bg-blue-700 !text-white !shadow-md !px-5 !py-2 !rounded-lg transition-all font-semibold border-none">
            + Buat Jurnal
          </Button>
        </div>
      </Card>

      {/* Filter Card */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <div className="grid gap-4 sm:grid-cols-4 items-end">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Status</p>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white text-slate-800">
              <option value="">Semua Status</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Periode</p>
            <Select value={filterPeriodeId} onChange={(e) => setFilterPeriodeId(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white text-slate-800">
              <option value="">Semua Periode</option>
              {periode.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.bulan}/{p.tahun} {p.sudahDitutup ? "(ditutup)" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Dari Tanggal</p>
            <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white text-slate-800" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Sampai Tanggal</p>
            <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white text-slate-800" />
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center">
            <Spinner label="Memuat data jurnal..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-sm font-bold text-slate-700">Nomor</th>
                <th className="px-5 py-4 text-sm font-bold text-slate-700">Tanggal</th>
                <th className="px-5 py-4 text-sm font-bold text-slate-700">Periode</th>
                <th className="px-5 py-4 text-sm font-bold text-slate-700">Status</th>
                <th className="px-5 py-4 text-sm font-bold text-slate-700">Keterangan</th>
                <th className="px-5 py-4 text-sm font-bold text-slate-700">Referensi</th>
                <th className="px-5 py-4 text-sm font-bold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((j) => (
                <tr key={j.id} className="hover:bg-blue-50/50 transition-colors border-b border-slate-100 last:border-0 group">
                  <td className="px-5 py-4 font-mono font-semibold text-slate-700">{j.nomor}</td>
                  <td className="px-5 py-4 text-slate-800">{formatDate(j.tanggal)}</td>
                  <td className="px-5 py-4 text-slate-600">{getPeriodeLabel(j.periodeId)}</td>
                  <td className="px-5 py-4">
                    {j.status === "DIPOSTING" ? (
                      <Badge tone="ok" className="!bg-green-100 !text-green-700 border border-green-200">DIPOSTING</Badge>
                    ) : j.status === "DRAF" ? (
                      <Badge className="!bg-slate-100 !text-slate-600 border border-slate-200">DRAF</Badge>
                    ) : (
                      <Badge tone="warn" className="!bg-red-100 !text-red-700 border border-red-200">DIBATALKAN</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600 truncate max-w-[200px]" title={j.keterangan}>{j.keterangan || "-"}</td>
                  <td className="px-5 py-4 text-slate-500">{j.referensi || "-"}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button onClick={() => openDetail(j)} className="!text-xs !bg-white !border !border-slate-300 !text-slate-600 hover:!bg-slate-100 !px-3 !py-1.5 shadow-sm rounded-lg">Detail</Button>
                      <Button onClick={() => openEdit(j)} disabled={j.status !== "DRAF"} className={`!text-xs !bg-white !border shadow-sm rounded-lg !px-3 !py-1.5 ${j.status !== "DRAF" ? 'opacity-50 cursor-not-allowed !border-slate-200 !text-slate-400' : '!border-blue-200 !text-blue-600 hover:!bg-blue-50'}`}>Edit</Button>
                      <Button onClick={() => posting(j)} disabled={j.status !== "DRAF"} className={`!text-xs shadow-sm rounded-lg !px-3 !py-1.5 border-none ${j.status !== "DRAF" ? 'opacity-50 cursor-not-allowed !bg-slate-200 !text-slate-500' : '!bg-emerald-500 hover:!bg-emerald-600 !text-white'}`}>Posting</Button>
                      <Button onClick={() => openBatal(j)} disabled={j.status !== "DIPOSTING"} className={`!text-xs shadow-sm rounded-lg !px-3 !py-1.5 border-none ${j.status !== "DIPOSTING" ? 'opacity-50 cursor-not-allowed !bg-slate-200 !text-slate-500' : '!bg-orange-500 hover:!bg-orange-600 !text-white'}`}>Batal</Button>
                      <Button variant="danger" onClick={() => remove(j)} disabled={j.status !== "DRAF"} className={`!text-xs shadow-sm rounded-lg !px-3 !py-1.5 border-none ${j.status !== "DRAF" ? 'opacity-50 cursor-not-allowed !bg-slate-100 !text-slate-400' : '!bg-red-50 !text-red-600 hover:!bg-red-100'}`}>Hapus</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl mb-2">📓</span>
                      <p className="text-base font-medium text-slate-600">Belum ada transaksi jurnal</p>
                      <p className="text-sm mt-1">Silakan klik tombol <b className="text-slate-700">+ Buat Jurnal</b>.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={detailOpen} title="Detail Jurnal Transaksi" onClose={() => setDetailOpen(false)} widthClass="max-w-4xl">
        {detailLoading ? (
          <div className="py-8"><Spinner label="Memuat detail..." /></div>
        ) : detail?.error ? (
          <p className="text-sm text-red-500 p-4">{detail.error}</p>
        ) : detail ? (
          <JurnalDetailView detail={detail} getPeriodeLabel={getPeriodeLabel} />
        ) : (
          <p className="text-sm text-slate-500">Tidak ada data.</p>
        )}
      </Modal>

      {/* Form modal (create/edit) */}
      <JurnalFormModal
        open={formOpen}
        mode={formMode}
        initial={formInitial}
        akunOptions={akunOptionsForJurnal}
        periodeOptions={periode}
        onClose={() => setFormOpen(false)}
        onSaved={async () => {
          setFormOpen(false);
          await loadList();
        }}
      />

      {/* Batal modal */}
      <Modal open={batalOpen} title="Batalkan Jurnal" onClose={() => setBatalOpen(false)}
        footer={
          <div className="flex justify-end gap-3 w-full border-t border-slate-100 pt-4">
            <Button onClick={() => setBatalOpen(false)} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !px-4 !py-2 !rounded-lg font-medium">Tutup</Button>
            <Button variant="primary" onClick={doBatal} className="!bg-orange-600 !text-white hover:!bg-orange-700 !border-none !px-6 !py-2 !rounded-lg font-semibold shadow-md">Simpan Pembatalan</Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 font-medium mb-2">Mohon masukkan alasan pembatalan jurnal ini:</p>
        <Textarea
          rows={4}
          value={alasanBatal}
          onChange={(e) => setAlasanBatal(e.target.value)}
          placeholder="Contoh: Transaksi salah input nominal, harus direvisi"
          className="w-full border-slate-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg shadow-sm"
        />
      </Modal>
    </div>
  );
}

function JurnalDetailView({ detail, getPeriodeLabel }) {
  const baris = detail.baris || [];
  const totalDebit = baris.reduce((s, b) => s + toNumber(b.debit), 0);
  const totalKredit = baris.reduce((s, b) => s + toNumber(b.kredit), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor Jurnal</p>
          <p className="font-mono text-lg font-bold text-slate-800 mt-1">{detail.nomor}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</p>
          <p className="text-lg text-slate-800 mt-1 font-medium">{formatDate(detail.tanggal)}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</p>
          <p className="mt-1">
            {detail.status === "DIPOSTING" ? <Badge tone="ok" className="!bg-green-100 !text-green-700">DIPOSTING</Badge> : 
             detail.status === "DRAF" ? <Badge className="!bg-slate-200 !text-slate-700">DRAF</Badge> : 
             <Badge tone="warn" className="!bg-red-100 !text-red-700">DIBATALKAN</Badge>}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Periode</p>
          <p className="text-slate-700 mt-1 font-medium">{getPeriodeLabel(detail.periodeId)}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Referensi</p>
          <p className="text-slate-700 mt-1">{detail.referensi || "-"}</p>
        </div>
        <div className="sm:col-span-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan Jurnal</p>
          <p className="text-slate-800 mt-1 bg-white p-3 rounded-lg border border-slate-200">{detail.keterangan || "-"}</p>
        </div>
        {detail.status === "DIBATALKAN" && (
          <div className="sm:col-span-3 bg-red-50 p-3 rounded-lg border border-red-100">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Alasan Batal</p>
            <p className="text-red-700 mt-1">{detail.alasanBatal || "-"}</p>
          </div>
        )}
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-5 py-3 text-sm font-bold text-slate-700 w-1/3">Akun</th>
              <th className="px-5 py-3 text-sm font-bold text-slate-700">Keterangan Baris</th>
              <th className="px-5 py-3 text-sm font-bold text-slate-700 text-right">Debit</th>
              <th className="px-5 py-3 text-sm font-bold text-slate-700 text-right">Kredit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {baris.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800">
                  <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mr-2">{b.kodeAkun}</span>
                  {b.namaAkun}
                </td>
                <td className="px-5 py-3 text-slate-600 text-sm">{b.keterangan || "-"}</td>
                <td className="px-5 py-3 text-right font-medium text-slate-800">{formatIDR(b.debit)}</td>
                <td className="px-5 py-3 text-right font-medium text-slate-800">{formatIDR(b.kredit)}</td>
              </tr>
            ))}
            {baris.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-slate-500">Tidak ada baris jurnal.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="bg-slate-800 text-white rounded-xl p-4 min-w-[300px] shadow-md">
          <div className="flex justify-between mb-2">
            <span className="text-slate-300">Total Debit</span>
            <span className="font-semibold">{formatIDR(totalDebit)}</span>
          </div>
          <div className="flex justify-between mb-2 border-b border-slate-600 pb-2">
            <span className="text-slate-300">Total Kredit</span>
            <span className="font-semibold">{formatIDR(totalKredit)}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-bold">Selisih</span>
            <span className={`font-bold ${totalDebit - totalKredit === 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatIDR(totalDebit - totalKredit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function JurnalFormModal({ open, mode, initial, akunOptions, periodeOptions, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const [tanggal, setTanggal] = useState("");
  const [periodeId, setPeriodeId] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [referensi, setReferensi] = useState("");
  const [baris, setBaris] = useState([]);

  useEffect(() => {
    if (!open) return;
    setFormErr("");

    if (isEdit && initial) {
      setTanggal(initial.tanggal || "");
      setPeriodeId(initial.periodeId || "");
      setKeterangan(initial.keterangan || "");
      setReferensi(initial.referensi || "");
      setBaris(
        (initial.baris || []).map((b) => ({
          akunId: b.akunId || "",
          debit: String(b.debit ?? "0"),
          kredit: String(b.kredit ?? "0"),
          keterangan: b.keterangan || "",
        }))
      );
    } else {
      setTanggal("");
      setPeriodeId("");
      setKeterangan("");
      setReferensi("");
      setBaris([
        { akunId: "", debit: "0", kredit: "0", keterangan: "" },
        { akunId: "", debit: "0", kredit: "0", keterangan: "" },
      ]);
    }
  }, [open, isEdit, initial]);

  const totals = useMemo(() => {
    const totalDebit = baris.reduce((s, b) => s + toNumber(b.debit), 0);
    const totalKredit = baris.reduce((s, b) => s + toNumber(b.kredit), 0);
    return { totalDebit, totalKredit, selisih: totalDebit - totalKredit };
  }, [baris]);

  function validate() {
    const errors = [];
    if (!tanggal) errors.push("Tanggal wajib diisi.");
    if (!periodeId) errors.push("Periode wajib dipilih.");
    if (baris.length < 2) errors.push("Jurnal minimal memiliki 2 baris.");

    baris.forEach((b, i) => {
      const d = toNumber(b.debit);
      const k = toNumber(b.kredit);
      if (!b.akunId) errors.push(`Baris ke-${i + 1}: Akun wajib dipilih.`);
      if (d <= 0 && k <= 0) errors.push(`Baris ke-${i + 1}: Nominal Debit atau Kredit harus lebih dari 0.`);
      if (d > 0 && k > 0) errors.push(`Baris ke-${i + 1}: Tidak boleh mengisi Debit dan Kredit sekaligus pada satu baris.`);
    });

    if (totals.totalDebit !== totals.totalKredit) {
      errors.push("Gagal menyimpan: Total Debit harus sama persis dengan Total Kredit (Balance).");
    }
    return errors;
  }

  function updateRow(i, patch) {
    setBaris((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setBaris((prev) => [...prev, { akunId: "", debit: "0", kredit: "0", keterangan: "" }]);
  }

  function removeRow(i) {
    setBaris((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e) {
    e.preventDefault();
    setFormErr("");

    const errors = validate();
    if (errors.length) {
      setFormErr(errors.join("\n"));
      return;
    }

    setSaving(true);
    
    // PERBAIKAN TIPE DATA ID (String menjadi Number)
    const payload = {
      tanggal,
      periodeId: isNaN(Number(periodeId)) ? periodeId : Number(periodeId),
      keterangan: keterangan || "",
      referensi: referensi || "",
      baris: baris.map((b) => ({
        akunId: isNaN(Number(b.akunId)) ? b.akunId : Number(b.akunId),
        debit: toNumber(b.debit),
        kredit: toNumber(b.kredit),
        keterangan: b.keterangan || "",
      })),
    };

    try {
      if (isEdit) {
        await JurnalAPI.update(initial.id, payload);
      } else {
        await JurnalAPI.create(payload);
      }
      await onSaved();
    } catch (err) {
      const ex = extractFieldErrors(err);
      setFormErr(ex.form || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? "Edit Jurnal (Mode DRAF)" : "Buat Jurnal Baru"} onClose={onClose} widthClass="max-w-5xl"
      footer={
        <div className="flex justify-between items-center w-full border-t border-slate-100 pt-4">
          <div className="text-sm font-medium">
            Status: <span className={totals.selisih === 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
              {totals.selisih === 0 ? "SEIMBANG (BALANCE)" : "TIDAK SEIMBANG"}
            </span>
          </div>
          <div className="flex gap-3">
            <Button onClick={onClose} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !px-4 !py-2 !rounded-lg font-medium">Batal</Button>
            <Button variant="primary" onClick={submit} disabled={saving} className="!bg-blue-600 !text-white hover:!bg-blue-700 !border-none !px-6 !py-2 !rounded-lg font-semibold shadow-md">
              {saving ? "Menyimpan..." : "Simpan Jurnal"}
            </Button>
          </div>
        </div>
      }
    >
      {!isEdit || initial ? (
        <form onSubmit={submit} className="space-y-6 pb-2">
          {formErr && (
            <div className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm font-medium">
              {formErr}
            </div>
          )}

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid gap-5 sm:grid-cols-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1.5">Tanggal</p>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 w-full rounded-lg shadow-sm bg-white" />
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold text-slate-700 mb-1.5">Periode Fiskal</p>
              <Select value={periodeId} onChange={(e) => setPeriodeId(e.target.value)} className="border-slate-300 w-full rounded-lg shadow-sm bg-white">
                <option value="">Pilih periode</option>
                {periodeOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.bulan}/{p.tahun} {p.sudahDitutup ? "(ditutup)" : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1.5">No. Referensi</p>
              <Input value={referensi} onChange={(e) => setReferensi(e.target.value)} placeholder="Cth: INV-001" className="border-slate-300 focus:border-blue-500 w-full rounded-lg shadow-sm bg-white" />
            </div>
            <div className="sm:col-span-4">
              <p className="text-sm font-semibold text-slate-700 mb-1.5">Keterangan Umum</p>
              <Input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Deskripsi singkat transaksi ini" className="border-slate-300 focus:border-blue-500 w-full rounded-lg shadow-sm bg-white" />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="flex items-center justify-between bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-700">Rincian Baris Jurnal</h3>
              <Button type="button" onClick={addRow} className="!text-xs !bg-white !border-slate-300 !text-slate-700 hover:!bg-blue-50 hover:!text-blue-700 hover:!border-blue-200 shadow-sm rounded">
                + Tambah Baris
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-[35%]">Akun</th>
                    <th className="px-4 py-3 font-semibold text-right w-[20%]">Debit (Rp)</th>
                    <th className="px-4 py-3 font-semibold text-right w-[20%]">Kredit (Rp)</th>
                    <th className="px-4 py-3 font-semibold w-[20%]">Catatan Baris</th>
                    <th className="px-4 py-3 font-semibold text-center w-[5%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {baris.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <Select value={b.akunId} onChange={(e) => updateRow(i, { akunId: e.target.value })} className="w-full border-slate-300 text-sm rounded shadow-sm">
                          <option value="">Pilih akun...</option>
                          {akunOptions.map((a) => (
                            <option key={a.id} value={a.id}>{a.kode} - {a.nama}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="p-3">
                        <Input inputMode="decimal" value={b.debit} onChange={(e) => updateRow(i, { debit: e.target.value })} className="w-full text-right border-slate-300 text-sm rounded shadow-sm" />
                      </td>
                      <td className="p-3">
                        <Input inputMode="decimal" value={b.kredit} onChange={(e) => updateRow(i, { kredit: e.target.value })} className="w-full text-right border-slate-300 text-sm rounded shadow-sm" />
                      </td>
                      <td className="p-3">
                        <Input value={b.keterangan} onChange={(e) => updateRow(i, { keterangan: e.target.value })} placeholder="Opsional" className="w-full border-slate-300 text-sm rounded shadow-sm" />
                      </td>
                      <td className="p-3 text-center">
                        <button type="button" onClick={() => removeRow(i)} disabled={baris.length <= 2} className={`p-2 rounded text-lg ${baris.length <= 2 ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors'}`} title="Hapus baris">
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td className="px-4 py-4 text-right font-bold text-slate-700">Total Keseluruhan</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-800">{formatIDR(totals.totalDebit)}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-800">{formatIDR(totals.totalKredit)}</td>
                    <td className="px-4 py-4" colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </form>
      ) : (
        <div className="py-10"><Spinner label="Memuat data jurnal untuk edit..." /></div>
      )}
    </Modal>
  );
}