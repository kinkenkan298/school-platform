export default function Select({ className = "", children, ...props }) {
  return (
    <select
      className={[
        "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm cursor-pointer",
        "outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </select>
  );
}