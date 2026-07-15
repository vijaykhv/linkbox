interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-ink-900 p-5 animate-pop-in pop-border pop-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-extrabold text-ink-950 dark:text-cream-50">{title}</h3>
        {description && (
          <p className="text-sm font-medium text-ink-950/50 dark:text-cream-100/50 mt-1.5">
            {description}
          </p>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl text-sm font-bold text-ink-950/60 dark:text-cream-100/60 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold text-white pop-border pop-shadow-sm pop-press ${
              danger ? "bg-red-600" : "bg-violet-500"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
