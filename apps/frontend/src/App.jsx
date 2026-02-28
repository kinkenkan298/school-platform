export default function App() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm text-slate-400">School Platform</p>
            <h1 className="text-xl font-semibold">Finance MVP</h1>
          </div>

          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Frontend • Vite + React + Tailwind
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="COA / Akun" desc="Buat, edit, dan kelola struktur akun." />
          <Card title="Periode Fiskal" desc="Buat periode dan tutup periode." />
          <Card title="Jurnal" desc="Input jurnal DRAF, posting, dan pembatalan." />
          <Card title="Laporan" desc="Buku besar, laba rugi, neraca, arus kas." />
        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-lg font-semibold">Tes Tailwind</h2>
          <p className="mt-1 text-sm text-slate-400">
            Kalau kartu-kartu di atas rapi dan tombol di bawah punya style, berarti Tailwind sudah aktif.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Ketik sesuatu…"
            />
            <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white">
              Simpan
            </button>
            <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900">
              Batal
            </button>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-2 text-xs text-slate-500">
        API base (nanti): http://localhost:3001/api/v1
      </footer>
    </div>
  );
}

function Card({ title, desc }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
      <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900">
        Buka <span aria-hidden>→</span>
      </button>
    </div>
  );
}