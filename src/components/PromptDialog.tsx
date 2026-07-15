import { useEffect, useState } from "react";

interface PromptDialogProps {
  open: boolean;
  title: string;
  confirmLabel?: string;
  initialValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function PromptDialog({
  open,
  title,
  confirmLabel = "Save",
  initialValue = "",
  placeholder = "Name",
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  if (!open) return null;

  function submit() {
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-ink-900 p-5 animate-pop-in pop-border pop-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-extrabold text-ink-950 dark:text-cream-50 mb-3">{title}</h3>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onCancel();
          }}
          className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 pop-border"
        />
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
            onClick={submit}
            disabled={!value.trim()}
            className="px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-violet-500 disabled:opacity-50 pop-border pop-shadow-sm pop-press"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
