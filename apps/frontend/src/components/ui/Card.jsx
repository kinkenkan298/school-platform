export default function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}