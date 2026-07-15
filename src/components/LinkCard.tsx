import { useRef } from "react";
import type { LinkWithTags, ViewMode } from "../types";

interface LinkCardProps {
  link: LinkWithTags;
  view: ViewMode;
  selected: boolean;
  selectionMode: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
  onEnterSelectionMode: () => void;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return "";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const LONG_PRESS_MS = 450;

export default function LinkCard({
  link,
  view,
  selected,
  selectionMode,
  onOpen,
  onToggleSelect,
  onEnterSelectionMode,
}: LinkCardProps) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  function handlePointerDown() {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      onEnterSelectionMode();
    }, LONG_PRESS_MS);
  }
  function clearPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  function handleClick(e: React.MouseEvent) {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (selectionMode) {
      onToggleSelect();
      return;
    }
    if ((e.target as HTMLElement).closest("[data-stop-open]")) return;
    onOpen();
  }

  const thumb = link.thumbnail_url || faviconFor(link.url);

  if (view === "list") {
    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={clearPress}
        onPointerLeave={clearPress}
        onClick={handleClick}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all animate-pop-in select-none ${
          selected
            ? "border-violet-400 bg-violet-50 dark:bg-violet-500/10"
            : "border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        }`}
      >
        {selectionMode && (
          <input
            type="checkbox"
            checked={selected}
            readOnly
            className="h-4 w-4 shrink-0 accent-violet-600"
          />
        )}
        <img
          src={thumb}
          alt=""
          className="h-9 w-9 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.visibility = "hidden";
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {link.title || hostname(link.url)}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
            {hostname(link.url)}
          </p>
        </div>
        {link.tags.length > 0 && (
          <div className="hidden sm:flex gap-1 shrink-0">
            {link.tags.slice(0, 2).map((t) => (
              <span
                key={t.id}
                className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}
        <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
          {formatDate(link.created_at)}
        </span>
      </div>
    );
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={clearPress}
      onPointerLeave={clearPress}
      onClick={handleClick}
      className={`group relative rounded-2xl border cursor-pointer overflow-hidden transition-all animate-pop-in select-none active:scale-[0.98] ${
        selected
          ? "border-violet-400 ring-2 ring-violet-400/50"
          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md"
      } bg-white dark:bg-neutral-900`}
    >
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={selected}
            readOnly
            className="h-4 w-4 accent-violet-600 rounded"
          />
        </div>
      )}
      <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
        {link.thumbnail_url ? (
          <img
            src={link.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <img src={faviconFor(link.url)} alt="" className="h-8 w-8 opacity-70" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">
          {link.title || hostname(link.url)}
        </p>
        {link.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
            {link.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
            {hostname(link.url)}
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0 ml-2">
            {formatDate(link.created_at)}
          </span>
        </div>
        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {link.tags.slice(0, 3).map((t) => (
              <span
                key={t.id}
                className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
