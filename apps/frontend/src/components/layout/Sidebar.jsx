import { useHashRouter } from "../../router/useHashRouter.js";
import Link from "../../router/Link.jsx";

const nav = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/akun", label: "Manajemen Akun", icon: "📁" },
  { to: "/periode", label: "Periode Fiskal", icon: "📅" },
  { to: "/jurnal", label: "Jurnal Umum", icon: "📝" },
  { to: "/laporan", label: "Laporan Keuangan", icon: "📈" },
  { to: "/environments", label: "Pengaturan API", icon: "⚙️" },
];

export default function Sidebar() {
  const { path } = useHashRouter();

  return (
    // Mengubah background sidebar menjadi putih murni dengan border abu-abu terang
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 sm:flex sm:flex-col shadow-sm">
      <div className="px-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            S
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Modul</p>
            <p className="text-sm font-bold text-slate-800">Finance System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 mt-2">
        {nav.map((item) => {
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-blue-50 text-blue-700 shadow-sm" // Saat aktif, warna biru cerah
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600", // Saat tidak aktif
              ].join(" ")}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 px-4 py-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium text-center">
        Versi 1.0 (Dev)
      </div>
    </aside>
  );
}