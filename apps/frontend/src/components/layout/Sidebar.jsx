import { useHashRouter } from "../../router/useHashRouter.js";
import Link from "../../router/Link.jsx";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/akun", label: "akun" },
  { to: "/periode", label: "periode" },
  { to: "/jurnal", label: "jurnal" },
  { to: "/laporan", label: "laporan" },
  { to: "/environments", label: "environments" },
];

export default function Sidebar() {
  const { path } = useHashRouter();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 px-3 py-4 sm:block">
      <div className="px-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <p className="text-xs text-slate-400">Menu (Bruno folders)</p>
          <p className="mt-1 text-sm font-semibold">Finance MVP</p>
        </div>
      </div>

      <nav className="mt-4 space-y-1">
        {nav.map((item) => {
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "block rounded-lg px-3 py-2 text-sm",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-300 hover:bg-slate-900/60 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 px-2 text-xs text-slate-500">
        Tip: gunakan menu ini untuk mapping ke request `.bru`.
      </div>
    </aside>
  );
}