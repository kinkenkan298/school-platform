export default function Checkbox({ label, className = "", ...props }) {
  return (
    <label className={["flex items-center gap-2 text-sm", className].join(" ")}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-700 bg-slate-950"
        {...props}
      />
      <span className="text-slate-200">{label}</span>
    </label>
  );
}