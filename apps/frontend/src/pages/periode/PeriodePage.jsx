import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Table, { TBody, TD, TH, THead } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { PeriodeAPI } from "../../api/periode.api.js";

export default function PeriodePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);
  const [bulan, setBulan] = useState("1");
  const [tahun, setTahun] = useState("2025");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await PeriodeAPI.list();
      setItems(res.data || []);
    } catch (e) {
      setError(e.message || "Gagal memuat periode");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setSaving(true);
    try {
      await PeriodeAPI.create({ bulan: Number(bulan), tahun: Number(tahun) });
      setOpen(false);
      await load();
      alert("Periode berhasil dibuat");
    } catch (e) {
      alert(e.message || "Gagal membuat periode");
    } finally {
      setSaving(false);
    }
  }

  async function tutup(row) {
    const ok = confirm(`Tutup periode ${row.bulan}/${row.tahun}? (permanen)`);
    if (!ok) return;
    try {
      await PeriodeAPI.tutup(row.id);
      await load();
      alert("Periode berhasil ditutup");
    } catch (e) {
      alert(e.message || "Gagal menutup periode");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">periode</h2>
          <p className="mt-1 text-sm text-slate-400">
            Mapping endpoint: <span className="text-slate-200">GET/POST /periode</span> dan{" "}
            <span className="text-slate-200">PATCH /periode/:id/tutup</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={load}>Refresh</Button>
          <Button variant="primary" onClick={() => setOpen(true)}>
            + Tambah Periode
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card>
          <Spinner label="Memuat periode..." />
        </Card>
      ) : error ? (
        <Card>
          <p className="text-sm text-red-300">{error}</p>
        </Card>
      ) : (
        <Table>
          <THead>
            <TH>Bulan</TH>
            <TH>Tahun</TH>
            <TH>Status</TH>
            <TH>Ditutup pada</TH>
            <TH className="text-right">Aksi</TH>
          </THead>
          <TBody>
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/40">
                <TD>{p.bulan}</TD>
                <TD>{p.tahun}</TD>
                <TD>
                  {p.sudahDitutup ? <Badge tone="warn">Ditutup</Badge> : <Badge tone="ok">Aktif</Badge>}
                </TD>
                <TD className="text-slate-300">{p.ditutupPada || "-"}</TD>
                <TD className="text-right">
                  <Button onClick={() => tutup(p)} disabled={p.sudahDitutup}>
                    Tutup
                  </Button>
                </TD>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <TD colSpan={5} className="py-6 text-center text-slate-400">
                  Tidak ada data.
                </TD>
              </tr>
            ) : null}
          </TBody>
        </Table>
      )}

      <Modal
        open={open}
        title="Tambah Periode"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={create} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Bulan (1-12)</p>
            <Input value={bulan} onChange={(e) => setBulan(e.target.value)} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Tahun (2000-2100)</p>
            <Input value={tahun} onChange={(e) => setTahun(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}