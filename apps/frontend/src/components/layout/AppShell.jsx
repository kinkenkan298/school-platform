import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ title, children }) {
  return (
    // Mengubah background utama menjadi cerah (bg-slate-50) dan teks menjadi gelap (text-slate-800)
    <div className="min-h-dvh bg-slate-50 text-slate-800 font-sans">
      <div className="mx-auto flex min-h-dvh max-w-7xl">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />
          
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-8">
            {children}
          </main>

          <footer className="px-6 pb-8 pt-4 text-sm text-slate-500 font-medium border-t border-slate-200 mt-auto text-center sm:text-left">
            School Platform Finance MVP • React + Vite + Tailwind
          </footer>
        </div>
      </div>
    </div>
  );
}