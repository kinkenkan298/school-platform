import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ title, children }) {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />
          <main className="min-w-0 flex-1 px-4 py-6">{children}</main>

          <footer className="px-4 pb-8 pt-2 text-xs text-slate-500">
            Finance MVP • React + Vite + Tailwind
          </footer>
        </div>
      </div>
    </div>
  );
}