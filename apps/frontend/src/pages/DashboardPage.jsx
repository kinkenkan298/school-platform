import Card from "../components/ui/Card.jsx";
import Link from "../router/Link.jsx";

export default function DashboardPage() {
  const cards = [
    { to: "/akun", title: "Manajemen Akun", desc: "Kelola Chart of Accounts (COA) dan filter data keuangan.", icon: "📁" },
    { to: "/periode", title: "Periode Fiskal", desc: "Pengaturan pembukaan dan penutupan periode laporan.", icon: "📅" },
    { to: "/jurnal", title: "Jurnal Transaksi", desc: "Catat transaksi, posting jurnal, dan batalkan draf.", icon: "📝" },
    { to: "/laporan", title: "Laporan Keuangan", desc: "Akses Buku Besar, Laba Rugi, Neraca, dan Arus Kas.", icon: "📊" },
    { to: "/environments", title: "Pengaturan API", desc: "Konfigurasi Base URL sistem untuk pengembangan.", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Keuangan</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Selamat datang di <span className="font-semibold text-blue-600">School Platform Finance</span>. 
          Gunakan modul di bawah ini untuk mengelola pembukuan dan laporan keuangan sekolah secara efisien.
        </p>
      </div>

      {/* Grid Menu Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.to} className="group transition-all hover:-translate-y-1">
            <Card className="h-full border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex flex-col h-full justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                    {c.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {c.desc}
                  </p>
                </div>
                
                <Link
                  to={c.to}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Buka Modul →
                </Link>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}