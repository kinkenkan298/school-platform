import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Table, { TBody, TD, TH, THead } from "../../components/ui/Table.jsx";
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
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [formInitial, setFormInitial] = useState(null);

  const [batalOpen, setBatalOpen] = useState(false);
  const [batalId, setBatalId] = useState("");
  const [alasanBatal, setAlasanBatal] = useState("");

  const akunOptionsForJurnal = useMemo(() => {
    // hanya akun detail & aktif
    return akun.filter((a) => a.aktif && !a.adalahInduk);
  }, [akun]);

  async function loadMaster() {
    try {
      const [p, a] = await Promise.all([PeriodeAPI.list(), AkunAPI.list()]);
      setPeriode(p.data || []);
      setAkun(a.data || []);
    } catch {
      // ignore (jurnal list tetap bisa jalan)
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

  async function openDetail(id) {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await JurnalAPI.detail(id);
      setDetail(res.data);
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
    // ambil detail dulu biar dapat baris
    setFormMode("edit");
    setFormInitial(null);
    setFormOpen(true);
    try {
      const res = await JurnalAPI.detail(row.id);
      setFormInitial(res.data);
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
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">jurnal</h2>
          <p className="mt-1 text-sm text-slate-400">
            Mapping endpoint: <span className="text-slate-200">GET/POST/PUT/DELETE /jurnal</span> +{" "}
            <span className="text-slate-200">PATCH posting/batal</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={loadList}>Refresh</Button>
          <Button variant="primary" onClick={openCreate}>
            + Buat Jurnal
          </Button>
        </div>
      </Card>

      <Card>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Semua</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-xs text-slate-400">Periode</p>
            <Select value={filterPeriodeId} onChange={(e) => setFilterPeriodeId(e.target.value)}>
              <option value="">Semua</option>
              {periode.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.bulan}/{p.tahun} {p.sudahDitutup ? "(ditutup)" : ""}
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
      </Card>

      {loading ? (
        <Card>
          <Spinner label="Memuat jurnal..." />
        </Card>
      ) : error ? (
        <Card>
          <p className="text-sm text-red-300">{error}</p>
        </Card>
      ) : (
        <Table>
          <THead>
            <TH>Nomor</TH>
            <TH>Tanggal</TH>
            <TH>Status</TH>
            <TH>Keterangan</TH>
            <TH>Referensi</TH>
            <TH className="text-right">Aksi</TH>
          </THead>
          <TBody>
            {items.map((j) => (
              <tr key={j.id} className="hover:bg-slate-900/40">
                <TD className="font-mono text-slate-200">{j.nomor}</TD>
                <TD>{formatDate(j.tanggal)}</TD>
                <TD>
                  {j.status === "DIPOSTING" ? (
                    <Badge tone="ok">DIPOSTING</Badge>
                  ) : j.status === "DRAF" ? (
                    <Badge> DRAF</Badge>
                  ) : (
                    <Badge tone="warn">DIBATALKAN</Badge>
                  )}
                </TD>
                <TD className="text-slate-200">{j.keterangan || "-"}</TD>
                <TD className="text-slate-300">{j.referensi || "-"}</TD>
                <TD className="text-right">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    <Button onClick={() => openDetail(j.id)}>Detail</Button>

                    <Button onClick={() => openEdit(j)} disabled={j.status !== "DRAF"}>
                      Edit
                    </Button>

                    <Button onClick={() => posting(j)} disabled={j.status !== "DRAF"}>
                      Posting
                    </Button>

                    <Button onClick={() => openBatal(j)} disabled={j.status !== "DIPOSTING"}>
                      Batal
                    </Button>

                    <Button variant="danger" onClick={() => remove(j)} disabled={j.status !== "DRAF"}>
                      Hapus
                    </Button>
                  </div>
                </TD>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <TD colSpan={6} className="py-6 text-center text-slate-400">
                  Tidak ada data.
                </TD>
              </tr>
            ) : null}
          </TBody>
        </Table>
      )}

      <Modal
        open={detailOpen}
        title="Detail Jurnal"
        onClose={() => setDetailOpen(false)}
        widthClass="max-w-3xl"
      >
        {detailLoading ? (
          <Spinner label="Memuat detail..." />
        ) : detail?.error ? (
          <p className="text-sm text-red-300">{detail.error}</p>
        ) : detail ? (
          <div className="space-y-3">
            <Card>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Nomor</p>
                  <p className="font-mono">{detail.nomor}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tanggal</p>
                  <p>{formatDate(detail.tanggal)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <p>{detail.status}</p>
                </div>
              </div>
            </Card>

            <Table>
              <THead>
                <TH>Akun</TH>
                <TH className="text-right">Debit</TH>
                <TH className="text-right">Kredit</TH>
                <TH>Keterangan</TH>
              </THead>
              <TBody>
                {(detail.baris || []).map((b) => (
                  <tr key={b.id}>
                    <TD>
                      <div className="text-slate-200">
                        <span className="font-mono">{b.kodeAkun}</span> — {b.namaAkun}
                      </div>
                    </TD>
                    <TD className="text-right">{formatIDR(b.debit)}</TD>
                    <TD className="text-right">{formatIDR(b.kredit)}</TD>
                    <TD className="text-slate-300">{b.keterangan || "-"}</TD>
                  </tr>
                ))}
              </TBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Tidak ada data.</p>
        )}
      </Modal>

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

      <Modal
        open={batalOpen}
        title="Batalkan Jurnal"
        onClose={() => setBatalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setBatalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={doBatal}>
              Simpan Alasan
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-400">
          Backend mewajibkan <b>alasanBatal</b>.
        </p>
        <div className="mt-3">
          <Textarea
            rows={4}
            value={alasanBatal}
            onChange={(e) => setAlasanBatal(e.target.value)}
            placeholder="Contoh: Transaksi salah input"
          />
        </div>
      </Modal>
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

      if (!b.akunId) errors.push(`Baris ${i + 1}: akun wajib dipilih.`);
      if (d <= 0 && k <= 0) errors.push(`Baris ${i + 1}: debit atau kredit harus > 0.`);
      if (d > 0 && k > 0) errors.push(`Baris ${i + 1}: tidak boleh debit & kredit sekaligus.`);
    });

    if (totals.totalDebit !== totals.totalKredit) {
      errors.push("Total debit harus sama dengan total kredit.");
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

    const payload = {
      tanggal,
      periodeId,
      keterangan: keterangan || "",
      referensi: referensi || "",
      baris: baris.map((b) => ({
        akunId: b.akunId,
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
    <Modal
      open={open}
      title={isEdit ? "Edit Jurnal (hanya DRAF)" : "Buat Jurnal"}
      onClose={onClose}
      widthClass="max-w-4xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Batal</Button>
          <Button variant="primary" onClick={submit} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      {!isEdit || initial ? (
        <form onSubmit={submit} className="space-y-4">
          {formErr ? (
            <div className="whitespace-pre-line rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {formErr}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">Tanggal</p>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400">Periode</p>
              <Select value={periodeId} onChange={(e) => setPeriodeId(e.target.value)}>
                <option value="">Pilih periode</option>
                {periodeOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.bulan}/{p.tahun} {p.sudahDitutup ? "(ditutup)" : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <p className="text-xs text-slate-400">Referensi</p>
              <Input value={referensi} onChange={(e) => setReferensi(e.target.value)} placeholder="BKM-001" />
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400">Keterangan</p>
            <Input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Deskripsi transaksi" />
          </div>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Baris Jurnal</p>
              <Button onClick={addRow}>+ Tambah Baris</Button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-300">
                  <tr>
                    <th className="px-2 py-2">Akun</th>
                    <th className="px-2 py-2 text-right">Debit</th>
                    <th className="px-2 py-2 text-right">Kredit</th>
                    <th className="px-2 py-2">Keterangan</th>
                    <th className="px-2 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {baris.map((b, i) => (
                    <tr key={i} className="align-top">
                      <td className="px-2 py-2">
                        <Select value={b.akunId} onChange={(e) => updateRow(i, { akunId: e.target.value })}>
                          <option value="">Pilih akun</option>
                          {akunOptions.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.kode} - {a.nama}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Input
                          inputMode="decimal"
                          value={b.debit}
                          onChange={(e) => updateRow(i, { debit: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Input
                          inputMode="decimal"
                          value={b.kredit}
                          onChange={(e) => updateRow(i, { kredit: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={b.keterangan}
                          onChange={(e) => updateRow(i, { keterangan: e.target.value })}
                          placeholder="opsional"
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Button onClick={() => removeRow(i)} disabled={baris.length <= 2} variant="danger">
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-slate-200">
                    <td className="px-2 py-3 text-right font-semibold" colSpan={1}>
                      Total
                    </td>
                    <td className="px-2 py-3 text-right font-semibold">{formatIDR(totals.totalDebit)}</td>
                    <td className="px-2 py-3 text-right font-semibold">{formatIDR(totals.totalKredit)}</td>
                    <td className="px-2 py-3 text-slate-400" colSpan={2}>
                      Selisih: <span className={totals.selisih === 0 ? "text-emerald-300" : "text-red-300"}>
                        {formatIDR(totals.selisih)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </form>
      ) : (
        <Spinner label="Memuat data jurnal untuk edit..." />
      )}
    </Modal>
  );
}