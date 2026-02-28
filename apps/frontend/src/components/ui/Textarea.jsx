export default function Textarea({ className = "", rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={[
        "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm",
        "outline-none focus:border-slate-400",
        className,
      ].join(" ")}
      {...props}
    />
  );
}