import { getApiBaseUrl } from "../../api/client.js";

export default function Topbar({ title }) {
  const baseUrl = getApiBaseUrl();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs text-slate-500">School Platform • Finance</p>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            API: {baseUrl}
          </span>
        </div>
      </div>
    </header>
  );
}