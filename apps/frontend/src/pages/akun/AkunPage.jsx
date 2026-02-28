import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Checkbox from "../../components/ui/Checkbox.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Table, { TBody, TD, TH, THead } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { AkunAPI } from "../../api/akun.api.js";
import { extractFieldErrors } from "../../utils/errors.js";

const TIPE = ["ASET", "LIABILITAS", "EKUITAS", "PENDAPATAN", "BEBAN"];
const SALDO = ["DEBIT", "KREDIT"];

export default function AkunPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [akun, setAkun] = useState([]);

  const [q, setQ] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [filterAktif, setFilterAktif] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await AkunAPI.list({
        tipe: filterTipe || undefined,
        aktif: filterAktif || undefined,
      });
      setAkun(res.data || []);
    } catch (e) {
      setError(e.message || "Gagal memuat akun");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTipe, filterAktif]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return akun;
    return akun.filter((a) => {
      const t = `${a.kode || ""} ${a.nama || ""}`.toLowerCase();
      return t.includes(s);
    });
  }, [akun, q]);

  const akunIndukOptions = useMemo(() => {
    return akun.filter((a) => a.adalahInduk === true);
  }, [akun]);

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

  async function onDelete(row) {
    const ok = confirm(`Hapus akun ${row.kode} - ${row.nama} ?`);
    if (!ok) return;

    try {
      await AkunAPI.remove(row.id);
      await load();
      alert("Akun berhasil dihapus");
    } catch (e) {
      alert(e.message || "Gagal menghapus akun");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">akun</h2>
          <p className="mt-1 text-sm text-slate-400">
            Mapping endpoint: <span className="text-slate-200">GET/POST/PUT/DELETE /akun</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={load}>Refresh</Button>
          <Button variant="primary" onClick={openCreate}>
            + Tambah Akun
          </Button>
        </div>
      </Card>

      <Card>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400">Cari (kode / nama)</p>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="contoh: 1101 / Kas" />
          </div>

          <div>
            <p className="text-xs text-slate-400">Filter tipe</p>
            <Select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}>
              <option value="">Semua</option>
              {TIPE.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-xs text-slate-400">Filter aktif</p>
            <Select value={filterAktif} onChange={(e) => setFilterAktif(e.target.value)}>
              <option value="">Semua</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <Spinner label="Memuat akun..." />
        </Card>
      ) : error ? (
        <Card>
          <p className="text-sm text-red-300">{error}</p>
        </Card>
      ) : (
        <Table>
          <THead>
            <TH>Kode</TH>
            <TH>Nama</TH>
            <TH>Tipe</TH>
            <TH>Saldo Normal</TH>
            <TH>Induk</TH>
            <TH>Status</TH>
            <TH className="text-right">Aksi</TH>
          </THead>
          <TBody>
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-900/40">
                <TD className="font-mono text-slate-200">{a.kode}</TD>
                <TD>{a.nama}</TD>
                <TD>{a.tipe}</TD>
                <TD>{a.saldoNormal}</TD>
                <TD className="text-slate-300">{a.indukId ? "Ada" : "-"}</TD>
                <TD>
                  {a.aktif ? <Badge tone="ok">Aktif</Badge> : <Badge tone="warn">Nonaktif</Badge>}
                  {a.adalahInduk ? <Badge className="ml-2">Induk</Badge> : null}
                </TD>
                <TD className="text-right">
                  <div className="inline-flex gap-2">
                    <Button onClick={() => openEdit(a)}>Edit</Button>
                    <Button variant="danger" onClick={() => onDelete(a)}>
                      Hapus
                    </Button>
                  </div>
                </TD>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <TD className="py-6 text-center text-slate-400" colSpan={7}>
                  Tidak ada data.
                </TD>
              </tr>
            ) : null}
          </TBody>
        </Table>
      )}

      <AkunFormModal
        open={modalOpen}
        mode={mode}
        initial={editing}
        akunIndukOptions={akunIndukOptions}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          setModalOpen(false);
          await load();
        }}
      />
    </div>
  );
}

function AkunFormModal({ open, mode, initial, akunIndukOptions, onClose, onSaved }) {
  const isEdit = mode === "edit";

  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [fields, setFields] = useState({
    kode: "",
    nama: "",
    tipe: "ASET",
    saldoNormal: "DEBIT",
    indukId: "",
    adalahInduk: false,
    aktif: true,
  });

  useEffect(() => {
    if (!open) return;
    setFormErr("");

    if (isEdit && initial) {
      setFields({
        kode: initial.kode ?? "",
        nama: initial.nama ?? "",
        tipe: initial.tipe ?? "ASET",
        saldoNormal: initial.saldoNormal ?? "DEBIT",
        indukId: initial.indukId ?? "",
        adalahInduk: Boolean(initial.adalahInduk),
        aktif: Boolean(initial.aktif),
      });
    } else {
      setFields({
        kode: "",
        nama: "",
        tipe: "ASET",
        saldoNormal: "DEBIT",
        indukId: "",
        adalahInduk: false,
        aktif: true,
      });
    }
  }, [open, isEdit, initial]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setFormErr("");

    const payload = {
      kode: fields.kode.trim(),
      nama: fields.nama.trim(),
      tipe: fields.tipe,
      saldoNormal: fields.saldoNormal,
      indukId: fields.indukId ? fields.indukId : null,
      adalahInduk: Boolean(fields.adalahInduk),
      aktif: Boolean(fields.aktif),
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
    <Modal
      open={open}
      title={isEdit ? "Edit Akun" : "Tambah Akun"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Batal</Button>
          <Button variant="primary" onClick={submit} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {formErr ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {formErr}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Kode</p>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={fields.kode}
              onChange={(e) => setFields((s) => ({ ...s, kode: e.target.value }))}
              placeholder="contoh: 1101"
            />
          </div>
          <div>
            <p className="text-xs text-slate-400">Nama</p>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={fields.nama}
              onChange={(e) => setFields((s) => ({ ...s, nama: e.target.value }))}
              placeholder="contoh: Kas Sekolah"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Tipe</p>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={fields.tipe}
              onChange={(e) => setFields((s) => ({ ...s, tipe: e.target.value }))}
            >
              {TIPE.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-slate-400">Saldo Normal</p>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={fields.saldoNormal}
              onChange={(e) => setFields((s) => ({ ...s, saldoNormal: e.target.value }))}
            >
              {SALDO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400">Induk (opsional)</p>
          <select
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={fields.indukId || ""}
            onChange={(e) => setFields((s) => ({ ...s, indukId: e.target.value }))}
          >
            <option value="">— Tidak ada —</option>
            {akunIndukOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.kode} - {a.nama}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Sesuai rules backend: induk harus akun dengan <b>adalahInduk=true</b>.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Checkbox
            label="Adalah Induk"
            checked={fields.adalahInduk}
            onChange={(e) => setFields((s) => ({ ...s, adalahInduk: e.target.checked }))}
          />
          <Checkbox
            label="Aktif"
            checked={fields.aktif}
            onChange={(e) => setFields((s) => ({ ...s, aktif: e.target.checked }))}
          />
        </div>
      </form>
    </Modal>
  );
}