const styles = {
  primary:
    "bg-slate-100 text-slate-900 hover:bg-white border border-transparent",
  secondary:
    "border border-slate-700 text-slate-100 hover:bg-slate-900",
  danger: "bg-red-500/90 text-white hover:bg-red-500 border border-transparent",
  ghost: "text-slate-200 hover:bg-slate-900 border border-transparent",
};

export default function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant] || styles.secondary,
        className,
      ].join(" ")}
      {...props}
    />
  );
}