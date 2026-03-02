export default function Table({ children, className = "" }) {
  return (
    <div className={["overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white", className].join(" ")}>
      <table className="w-full border-collapse text-sm text-left">{children}</table>
    </div>
  );
}

export function THead({ children, className = "" }) {
  return (
    <thead className={["bg-slate-50 border-b border-slate-200", className].join(" ")}>
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({ children, className = "" }) {
  return (
    <th className={["px-4 py-3 font-bold text-slate-700 whitespace-nowrap", className].join(" ")}>
      {children}
    </th>
  );
}

export function TBody({ children, className = "" }) {
  return <tbody className={["divide-y divide-slate-100", className].join(" ")}>{children}</tbody>;
}

export function TD({ children, className = "" }) {
  return (
    <td className={["px-4 py-3 text-slate-800", className].join(" ")}>
      {children}
    </td>
  );
}