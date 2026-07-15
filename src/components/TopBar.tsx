import type { ViewMode } from "../types";

interface TopBarProps {
  title: string;
  search: string;
  onSearchChange: (v: string) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  onOpenSidebar: () => void;
}

export default function TopBar({
  title,
  search,
  onSearchChange,
  view,
  onViewChange,
  selectionMode,
  onToggleSelectionMode,
  onOpenSidebar,
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-cream-100/90 dark:bg-ink-950/90 backdrop-blur border-b-2 border-ink-950 dark:border-cream-100/85">
      <div className="flex items-center gap-3 px-4 h-16">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden p-1.5 -ml-1.5 rounded-lg text-ink-950/60 dark:text-cream-100/60 hover:bg-cream-200 dark:hover:bg-ink-800"
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="text-xl font-extrabold tracking-tight text-ink-950 dark:text-cream-50 shrink-0 hidden sm:block">
          {title}
        </h1>

        <div className="relative flex-1 max-w-md ml-auto">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-950/40 dark:text-cream-100/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search links…"
            className="w-full rounded-full bg-white dark:bg-ink-800 pl-10 pr-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 pop-border pop-shadow-sm transition-shadow"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex items-center bg-white dark:bg-ink-800 rounded-full p-0.5 pop-border">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={`px-2.5 py-1 rounded-full text-sm transition-colors ${view === "grid" ? "bg-amber-300 text-ink-950" : "text-ink-950/40 dark:text-cream-100/40"}`}
              aria-label="Grid view"
            >
              ▦
            </button>
            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={`px-2.5 py-1 rounded-full text-sm transition-colors ${view === "list" ? "bg-amber-300 text-ink-950" : "text-ink-950/40 dark:text-cream-100/40"}`}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
          <button
            type="button"
            onClick={onToggleSelectionMode}
            className={`text-xs font-bold px-3 py-2 rounded-full pop-border pop-press transition-colors ${
              selectionMode
                ? "bg-violet-500 text-white pop-shadow-sm"
                : "bg-white dark:bg-ink-800 text-ink-950/70 dark:text-cream-100/70"
            }`}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
