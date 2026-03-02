const styles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm",
  secondary: "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 border-transparent",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent",
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
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 border",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-inherit",
        styles[variant] || styles.secondary,
        className,
      ].join(" ")}
      {...props}
    />
  );
}