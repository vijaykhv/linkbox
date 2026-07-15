import { useEffect, useState } from "react";
import { PALETTE } from "../lib/collectionColor";

const EMOJI_OPTIONS = [
  "📚", "🔥", "⭐", "🌊", "🌿", "🍊", "🔮", "🩷",
  "📁", "💡", "🎨", "🎵", "🎬", "🍔", "✈️", "💻",
  "🏋️", "🐶", "🎮", "📷", "🛒", "📌", "🧠", "💰",
];

interface CollectionEditorDialogProps {
  open: boolean;
  title: string;
  confirmLabel?: string;
  initialName?: string;
  initialColorIndex?: number;
  initialEmoji?: string;
  onConfirm: (value: { name: string; colorIndex: number; emoji: string }) => void;
  onCancel: () => void;
}

export default function CollectionEditorDialog({
  open,
  title,
  confirmLabel = "Create",
  initialName = "",
  initialColorIndex = 0,
  initialEmoji = EMOJI_OPTIONS[0],
  onConfirm,
  onCancel,
}: CollectionEditorDialogProps) {
  const [name, setName] = useState(initialName);
  const [colorIndex, setColorIndex] = useState(initialColorIndex);
  const [emoji, setEmoji] = useState(initialEmoji);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setColorIndex(initialColorIndex);
      setEmoji(initialEmoji);
    }
  }, [open, initialName, initialColorIndex, initialEmoji]);

  if (!open) return null;

  function submit() {
    const trimmed = name.trim();
    if (trimmed) onConfirm({ name: trimmed, colorIndex, emoji });
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onCancel();
          }}
          className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 pop-border"
        />

        <p className="text-xs font-bold uppercase tracking-wide text-ink-950/40 dark:text-cream-100/40 mt-4 mb-2">
          Color
        </p>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setColorIndex(i)}
              aria-label={`Color ${i + 1}`}
              aria-pressed={colorIndex === i}
              className={`h-8 w-8 rounded-full pop-border transition-transform ${
                colorIndex === i ? "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-ink-900 scale-110" : ""
              }`}
              style={{ backgroundColor: c.icon }}
            />
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-ink-950/40 dark:text-cream-100/40 mt-4 mb-2">
          Icon
        </p>
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-label={`Icon ${e}`}
              aria-pressed={emoji === e}
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-base bg-cream-100 dark:bg-ink-800 pop-border transition-transform ${
                emoji === e ? "ring-2 ring-violet-500 scale-110" : ""
              }`}
            >
              {e}
            </button>
          ))}
        </div>

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
            disabled={!name.trim()}
            className="px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-violet-500 disabled:opacity-50 pop-border pop-shadow-sm pop-press"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
