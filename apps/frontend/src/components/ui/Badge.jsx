const styles = {
  ok: "border-emerald-700 bg-emerald-900/30 text-emerald-200",
  warn: "border-amber-700 bg-amber-900/30 text-amber-200",
  err: "border-red-700 bg-red-900/30 text-red-200",
  neutral: "border-slate-700 bg-slate-900/30 text-slate-200",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        styles[tone] || styles.neutral,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}