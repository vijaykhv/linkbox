import type { CollectionColor } from "../lib/collectionColor";

interface CollectionCardProps {
  name: string;
  color: CollectionColor;
  linkCount: number;
  onOpen: () => void;
}

export default function CollectionCard({ name, color, linkCount, onOpen }: CollectionCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative text-left animate-pop-in select-none active:scale-[0.98] transition-transform"
    >
      <div
        className="h-5 w-2/3 rounded-t-lg pop-border border-b-0"
        style={{ backgroundColor: color.icon }}
        aria-hidden
      />
      <div className="rounded-2xl rounded-tl-none bg-white dark:bg-ink-900 pop-border pop-shadow-sm group-hover:pop-shadow transition-shadow p-4 -mt-px">
        <div className="flex items-start justify-between mb-6">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center text-xl pop-border pop-shadow-sm"
            style={{ backgroundColor: color.bg }}
          >
            {color.emoji}
          </div>
          <span className="text-xs font-bold text-ink-950/40 dark:text-cream-100/40 mt-1">
            {linkCount} {linkCount === 1 ? "link" : "links"}
          </span>
        </div>
        <p className="text-base font-extrabold text-ink-950 dark:text-cream-50 truncate">{name}</p>
      </div>
    </button>
  );
}
