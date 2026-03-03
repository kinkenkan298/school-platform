import { getApiBaseUrl } from "../../api/client.js";

export default function Topbar({ title }) {
  const baseUrl = getApiBaseUrl();

  return (
    // Mengubah header menjadi putih transparan (blur) dengan garis bawah yang tipis
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">School Platform</p>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <p className="text-xs font-medium text-slate-500">Finance Module</p>
          </div>
          
          <h1 className="text-xl font-bold text-slate-800 mt-0.5 capitalize">{title}</h1>
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          {/* Label API sekarang terlihat lebih rapi dengan warna abu-abu muda */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-600">
              API: <span className="font-mono text-slate-500">{baseUrl}</span>
            </span>
          </div>

          {/* Dummy Profil Pengguna */}
          <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm cursor-pointer hover:bg-blue-200 transition-colors">
            A
          </div>
        </div>
      </div>
    </header>
  );
}