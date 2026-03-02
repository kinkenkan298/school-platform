export default function Spinner({ label = "Memuat data..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div className="relative h-8 w-8">
        <span className="absolute inset-0 rounded-full border-4 border-slate-100"></span>
        <span className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></span>
      </div>
      <span className="text-sm font-medium text-slate-500 animate-pulse">{label}</span>
    </div>
  );
}