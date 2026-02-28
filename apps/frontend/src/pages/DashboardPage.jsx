import Card from "../components/ui/Card.jsx";
import Link from "../router/Link.jsx";

export default function DashboardPage() {
  const cards = [
    { to: "/akun", title: "akun", desc: "CRUD akun (COA) + filter" },
    { to: "/periode", title: "periode", desc: "Buat & tutup periode fiskal" },
    { to: "/jurnal", title: "jurnal", desc: "DRAF, posting, batal, detail baris" },
    { to: "/laporan", title: "laporan", desc: "Buku besar, laba rugi, neraca, arus kas" },
    { to: "/environments", title: "environments", desc: "Set API base URL seperti Bruno env" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-semibold">Frontend Finance MVP</h2>
        <p className="mt-1 text-sm text-slate-400">
          Ini skeleton UI untuk mapping endpoint dari folder <span className="text-slate-200">school-platform-bruno</span>.
          Setelah kamu kirim isi `.bru`, kita tinggal rapikan field & tampilan sesuai request/response real.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.to}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{c.desc}</p>
              </div>
              <Link
                to={c.to}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
              >
                Buka →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}