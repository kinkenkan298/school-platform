export default function Textarea({ className = "", rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={[
        "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm",
        "outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all",
        className,
      ].join(" ")}
      {...props}
    />
  );
}