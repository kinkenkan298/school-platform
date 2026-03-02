import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Checkbox from "../../components/ui/Checkbox.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
// Menghapus import Table bawaan karena kita akan menggunakan tag standar HTML
import Badge from "../../components/ui/Badge.jsx";
import { AkunAPI, TIPE_AKUN } from "../../api/akun.api.js";
import { extractFieldErrors } from "../../utils/errors.js";

const SALDO = ["DEBIT", "KREDIT"];

export default function AkunPage() {
  const [loading, setLoading] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [error, setError] = useState("");

  const [akunAll, setAkunAll] = useState([]);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [filterTipe, setFilterTipe] = useState("ASET");
  const [filterAktif, setFilterAktif] = useState("");
  const [filterIndukId, setFilterIndukId] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editing, setEditing] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailData, setDetailData] = useState(null);

  async function loadMaster() {
    setLoadingMaster(true);
    try {
      const res = await AkunAPI.listAll();
      setAkunAll(res.data || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingMaster(false);
    }
  }

  async function loadRows() {
    setLoading(true);
    setError("");
    try {
      const res = await AkunAPI.list({
        tipe: filterTipe,
        aktif: filterAktif || undefined,
        indukId: filterIndukId || undefined,
      });
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || "Gagal memuat data akun. Pastikan Backend berjalan normal.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    await Promise.all([loadMaster(), loadRows()]);
  }

  useEffect(() => {
    loadMaster();
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTipe, filterAktif, filterIndukId]);

  const akunIndukAll = useMemo(() => {
    return (akunAll || []).filter((a) => a.adalahInduk === true);
  }, [akunAll]);

  const indukOptionsForFilter = useMemo(() => {
    return akunIndukAll.filter((a) => a.tipe === filterTipe);
  }, [akunIndukAll, filterTipe]);

  const filteredRows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((a) => {
      const t = `${a.kode || ""} ${a.nama || ""}`.toLowerCase();
      return t.includes(s);
    });
  }, [rows, q]);

  function openCreate() {
    setMode("create");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row) {
    setMode("edit");
    setEditing(row);
    setModalOpen(true);
  }

  async function openDetail(row) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setDetailData(null);

    try {
      const res = await AkunAPI.detail(row.id);
      setDetailData(res.data);
    } catch (e) {
      setDetailError(e.message || "Gagal mengambil detail akun");
    } finally {
      setDetailLoading(false);
    }
  }

  async function onDelete(row) {
    const ok = confirm(`Hapus akun ${row.kode} - ${row.nama}?`);
    if (!ok) return;

    try {
      await AkunAPI.remove(row.id);
      await refreshAll();
      alert("Akun berhasil dihapus");
    } catch (e) {
      alert(e.message || "Gagal menghapus akun");
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header Card */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Akun (COA)</h2>
          {loadingMaster && (
            <p className="mt-2 text-xs font-medium text-blue-500 animate-pulse">Memuat master akun untuk dropdown…</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={refreshAll} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !shadow-sm !px-4 !py-2 !rounded-lg transition-all font-medium">
            ↻ Refresh
          </Button>
          <Button variant="primary" onClick={openCreate} className="!bg-blue-600 hover:!bg-blue-700 !text-white !shadow-md !px-5 !py-2 !rounded-lg transition-all font-semibold border-none">
            + Tambah Akun
          </Button>
        </div>
      </Card>

      {/* Filter Card */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <div className="grid gap-4 sm:grid-cols-5 items-end">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold text-slate-600 mb-2">Cari Akun</p>
            <Input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Contoh: 1101 atau Kas..." 
              className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm bg-white text-slate-800"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Tipe</p>
            <Select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white text-slate-800">
              {TIPE_AKUN.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Status</p>
            <Select value={filterAktif} onChange={(e) => setFilterAktif(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white text-slate-800">
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </Select>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Induk</p>
            <Select value={filterIndukId} onChange={(e) => setFilterIndukId(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm bg-white text-slate-800">
              <option value="">Semua Induk</option>
              {indukOptionsForFilter.map((a) => (
                <option key={a.id} value={a.id}>{a.kode} - {a.nama}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Table Section (Using standard HTML table for perfect layout) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center">
            <Spinner label="Mengambil data akun..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Kode</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Nama Akun</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Tipe</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Saldo Normal</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Induk</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-slate-700">{a.kode}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{a.nama}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">{a.tipe}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{a.saldoNormal}</td>
                  <td className="px-6 py-4 text-slate-500">{a.indukId ? "Ada" : "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {a.aktif ? <Badge tone="ok" className="!bg-green-100 !text-green-700 border border-green-200">Aktif</Badge> : <Badge tone="warn" className="!bg-orange-100 !text-orange-700 border border-orange-200">Nonaktif</Badge>}
                      {a.adalahInduk && <Badge className="!bg-blue-100 !text-blue-700 border border-blue-200">Induk</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => openDetail(a)} className="!text-xs !bg-white !border !border-slate-300 !text-slate-600 hover:!bg-slate-100 !px-3 !py-1.5 shadow-sm rounded-lg">Detail</Button>
                      <Button onClick={() => openEdit(a)} className="!text-xs !bg-white !border !border-blue-200 !text-blue-600 hover:!bg-blue-50 !px-3 !py-1.5 shadow-sm rounded-lg">Edit</Button>
                      <Button variant="danger" onClick={() => onDelete(a)} className="!text-xs !bg-red-50 !text-red-600 hover:!bg-red-100 !border-none !px-3 !py-1.5 shadow-sm rounded-lg">Hapus</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td className="py-12 text-center text-slate-500" colSpan={7}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl mb-2">📭</span>
                      <p className="text-base font-medium text-slate-600">Belum ada data akun</p>
                      <p className="text-sm mt-1">Silakan klik tombol <b className="text-slate-700">+ Tambah Akun</b> untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AkunFormModal
        open={modalOpen}
        mode={mode}
        initial={editing}
        akunIndukAll={akunIndukAll}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          setModalOpen(false);
          await refreshAll();
        }}
      />

      <Modal open={detailOpen} title="Detail Akun" onClose={() => setDetailOpen(false)} widthClass="max-w-2xl">
        {detailLoading ? (
          <Spinner label="Memuat detail akun..." />
        ) : detailError ? (
          <p className="text-sm text-red-500">{detailError}</p>
        ) : detailData ? (
          <div className="space-y-4">
            <div className="grid gap-6 sm:grid-cols-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kode Akun</p>
                <p className="font-mono text-xl font-bold text-slate-800 mt-1">{detailData.kode}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Akun</p>
                <p className="text-xl font-semibold text-slate-800 mt-1">{detailData.nama}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</p>
                <p className="text-slate-700 mt-1 font-medium">{detailData.tipe}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Normal</p>
                <p className="text-slate-700 mt-1 font-medium">{detailData.saldoNormal}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Induk ID</p>
                <p className="font-mono text-slate-500 mt-1">{detailData.indukId || "Tidak memiliki induk"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status & Tag</p>
                <div className="flex flex-wrap gap-2">
                  {detailData.aktif ? <Badge tone="ok" className="!bg-green-100 !text-green-700 border border-green-200">Aktif</Badge> : <Badge tone="warn" className="!bg-orange-100 !text-orange-700 border border-orange-200">Nonaktif</Badge>}
                  {detailData.adalahInduk ? <Badge className="!bg-blue-100 !text-blue-700 border border-blue-200">Induk</Badge> : <Badge tone="neutral" className="!bg-slate-200 !text-slate-700 border border-slate-300">Detail</Badge>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Tidak ada data.</p>
        )}
      </Modal>
    </div>
  );
}

function AkunFormModal({ open, mode, initial, akunIndukAll, onClose, onSaved }) {
  const isEdit = mode === "edit";

  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [fields, setFields] = useState({
    kode: "", nama: "", tipe: "ASET", saldoNormal: "DEBIT", indukId: "", adalahInduk: false, aktif: true,
  });

  useEffect(() => {
    if (!open) return;
    setFormErr("");
    if (isEdit && initial) {
      setFields({
        kode: initial.kode ?? "", nama: initial.nama ?? "", tipe: initial.tipe ?? "ASET",
        saldoNormal: initial.saldoNormal ?? "DEBIT", indukId: initial.indukId ?? "",
        adalahInduk: Boolean(initial.adalahInduk), aktif: Boolean(initial.aktif),
      });
    } else {
      setFields({ kode: "", nama: "", tipe: "ASET", saldoNormal: "DEBIT", indukId: "", adalahInduk: false, aktif: true });
    }
  }, [open, isEdit, initial]);

  const indukOptionsForForm = useMemo(() => {
    return (akunIndukAll || []).filter((a) => a.tipe === fields.tipe);
  }, [akunIndukAll, fields.tipe]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setFormErr("");

    const payload = {
      kode: fields.kode.trim(), nama: fields.nama.trim(), tipe: fields.tipe, saldoNormal: fields.saldoNormal,
      indukId: fields.indukId ? fields.indukId : null, adalahInduk: Boolean(fields.adalahInduk), aktif: Boolean(fields.aktif),
    };

    try {
      if (isEdit) {
        await AkunAPI.update(initial.id, payload);
      } else {
        await AkunAPI.create(payload);
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
    <Modal open={open} title={isEdit ? "Update Akun" : "Buat Akun Baru"} onClose={onClose}
      footer={
        <div className="flex justify-end gap-3 w-full border-t border-slate-100 pt-4">
          <Button onClick={onClose} className="!bg-white !border !border-slate-300 !text-slate-700 hover:!bg-slate-50 !px-4 !py-2 !rounded-lg font-medium">Batal</Button>
          <Button variant="primary" onClick={submit} disabled={saving} className="!bg-blue-600 !text-white hover:!bg-blue-700 !border-none !px-6 !py-2 !rounded-lg font-semibold shadow-md">
            {saving ? "Menyimpan..." : "Simpan Data"}
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-5 pb-2">
        {formErr && (
          <div className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm font-medium">
            {formErr}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1.5">Kode Akun</p>
            <Input value={fields.kode} onChange={(e) => setFields((s) => ({ ...s, kode: e.target.value }))} className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 w-full rounded-lg shadow-sm" placeholder="Cth: 1101" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1.5">Nama Akun</p>
            <Input value={fields.nama} onChange={(e) => setFields((s) => ({ ...s, nama: e.target.value }))} className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 w-full rounded-lg shadow-sm" placeholder="Cth: Kas Kecil" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1.5">Tipe</p>
            <Select value={fields.tipe} onChange={(e) => setFields((s) => ({ ...s, tipe: e.target.value }))} className="border-slate-300 w-full rounded-lg shadow-sm">
              {TIPE_AKUN.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1.5">Saldo Normal</p>
            <Select value={fields.saldoNormal} onChange={(e) => setFields((s) => ({ ...s, saldoNormal: e.target.value }))} className="border-slate-300 w-full rounded-lg shadow-sm">
              {SALDO.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1.5">Pilih Induk (Opsional)</p>
          <Select value={fields.indukId || ""} onChange={(e) => setFields((s) => ({ ...s, indukId: e.target.value }))} className="border-slate-300 w-full rounded-lg shadow-sm">
            <option value="">— Tidak ada Induk —</option>
            {indukOptionsForForm.map((a) => <option key={a.id} value={a.id}>{a.kode} - {a.nama}</option>)}
          </Select>
        </div>

        <div className="flex flex-wrap gap-8 bg-slate-50 p-5 rounded-xl border border-slate-200 mt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox checked={fields.adalahInduk} onChange={(e) => setFields((s) => ({ ...s, adalahInduk: e.target.checked }))} className="w-5 h-5" />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">Jadikan Akun Induk</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox checked={fields.aktif} onChange={(e) => setFields((s) => ({ ...s, aktif: e.target.checked }))} className="w-5 h-5" />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">Status Aktif</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}