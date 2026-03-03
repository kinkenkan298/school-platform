export default function Checkbox({ label, className = "", ...props }) {
  return (
    <label className={["flex items-center gap-2.5 text-sm cursor-pointer group", className].join(" ")}>
      <input
        type="checkbox"
        className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white transition-all cursor-pointer"
        {...props}
      />
      {label && <span className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{label}</span>}
    </label>
  );
}