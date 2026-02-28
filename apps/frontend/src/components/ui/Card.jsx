export default function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-xl border border-slate-800 bg-slate-900/40 p-4",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}