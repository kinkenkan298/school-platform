import Button from "./Button.jsx";

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  widthClass = "max-w-2xl",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={[
          "relative w-full rounded-xl border border-slate-800 bg-slate-950 shadow-2xl",
          widthClass,
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <Button variant="ghost" onClick={onClose} className="px-2">
            ✕
          </Button>
        </div>

        <div className="max-h-[70vh] overflow-auto px-4 py-4">{children}</div>

        <div className="border-t border-slate-800 px-4 py-3">
          {footer || (
            <div className="flex justify-end">
              <Button onClick={onClose}>Tutup</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}