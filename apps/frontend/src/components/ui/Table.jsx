export default function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-slate-900/60 text-slate-200">
      <tr className="text-left">{children}</tr>
    </thead>
  );
}

export function TH({ children, className = "" }) {
  return (
    <th className={["px-3 py-2 font-medium", className].join(" ")}>
      {children}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-800">{children}</tbody>;
}

export function TD({ children, className = "" }) {
  return (
    <td className={["px-3 py-2 text-slate-100", className].join(" ")}>
      {children}
    </td>
  );
}