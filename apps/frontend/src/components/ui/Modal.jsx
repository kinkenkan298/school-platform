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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={[
          "relative w-full max-h-full flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200",
          widthClass,
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 bg-slate-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <Button variant="ghost" onClick={onClose} className="!p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-2xl">
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