const styles = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-orange-200 bg-orange-50 text-orange-700",
  err: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
        styles[tone] || styles.neutral,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}