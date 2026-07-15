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
    <div className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-950/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-3 px-4 h-16">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden p-1.5 -ml-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 shrink-0 hidden sm:block">
          {title}
        </h1>

        <div className="relative flex-1 max-w-md ml-auto">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
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
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-neutral-800 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-neutral-400"}`}
              aria-label="Grid view"
            >
              ▦
            </button>
            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-neutral-400"}`}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
          <button
            type="button"
            onClick={onToggleSelectionMode}
            className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
              selectionMode
                ? "bg-violet-600 text-white"
                : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
