export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg w-fit">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={[
              "rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}