import { useRef } from "react";
import type { LinkWithTags, ViewMode } from "../types";
import type { CollectionColor } from "../lib/collectionColor";
import { detectPlatform, faviconFor, hostname } from "../lib/platform";

interface LinkCardProps {
  link: LinkWithTags;
  view: ViewMode;
  selected: boolean;
  selectionMode: boolean;
  collectionName: string | null;
  collectionColor: CollectionColor | null;
  onOpen: () => void;
  onToggleSelect: () => void;
  onEnterSelectionMode: () => void;
}

const NEW_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function isNew(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < NEW_THRESHOLD_MS;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function PlayOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="h-11 w-11 rounded-full bg-black/55 flex items-center justify-center text-white text-lg pl-0.5">
        ▶
      </div>
    </div>
  );
}

function NewRibbon() {
  return (
    <span className="absolute top-2 left-2 z-10 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-300 text-ink-950 pop-border pop-shadow-sm -rotate-6">
      NEW
    </span>
  );
}

const LONG_PRESS_MS = 450;

function CollectionPill({
  name,
  color,
}: {
  name: string;
  color: CollectionColor;
}) {
  return (
    <span
      className="text-[11px] font-bold px-2 py-0.5 rounded-full pop-border pop-shadow-sm whitespace-nowrap"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {name}
    </span>
  );
}

export default function LinkCard({
  link,
  view,
  selected,
  selectionMode,
  collectionName,
  collectionColor,
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
  const platform = detectPlatform(link.url);
  const linkIsNew = isNew(link.created_at);

  if (view === "list") {
    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={clearPress}
        onPointerLeave={clearPress}
        onClick={handleClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all animate-pop-in select-none bg-white dark:bg-ink-900 pop-border ${
          selected ? "pop-shadow ring-2 ring-violet-400" : "pop-shadow-sm hover:pop-shadow"
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
          className="h-9 w-9 rounded-lg object-cover bg-cream-200 dark:bg-ink-800 shrink-0 pop-border"
          onError={(e) => {
            (e.target as HTMLImageElement).style.visibility = "hidden";
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-950 dark:text-cream-50 truncate">
            {link.title || hostname(link.url)}
          </p>
          <p className="text-xs text-ink-950/40 dark:text-cream-100/40 truncate">
            {hostname(link.url)}
          </p>
        </div>
        {collectionName && collectionColor && (
          <div className="hidden sm:block shrink-0">
            <CollectionPill name={collectionName} color={collectionColor} />
          </div>
        )}
        <span className="text-xs font-medium text-ink-950/40 dark:text-cream-100/40 shrink-0">
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
      className={`group relative rounded-2xl cursor-pointer overflow-hidden transition-all animate-pop-in select-none active:scale-[0.98] bg-white dark:bg-ink-900 pop-border ${
        selected ? "pop-shadow ring-2 ring-violet-400" : "pop-shadow-sm hover:pop-shadow hover:-translate-y-0.5"
      }`}
    >
      {!selectionMode && linkIsNew && <NewRibbon />}
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
      <div className="relative aspect-[16/9] bg-cream-200 dark:bg-ink-800 flex items-center justify-center overflow-hidden border-b-2 border-ink-950 dark:border-cream-100/85">
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
        {platform?.isVideo && <PlayOverlay />}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-ink-950 dark:text-cream-50 line-clamp-1">
          {link.title || hostname(link.url)}
        </p>
        {link.description && (
          <p className="text-xs text-ink-950/50 dark:text-cream-100/50 line-clamp-2 mt-0.5">
            {link.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-ink-950/40 dark:text-cream-100/40 truncate">
            {platform && (
              <img src={faviconFor(link.url)} alt="" className="h-3.5 w-3.5 rounded-sm shrink-0" />
            )}
            {platform?.name ?? hostname(link.url)}
          </span>
          <span className="text-xs font-medium text-ink-950/40 dark:text-cream-100/40 shrink-0">
            {formatDate(link.created_at)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1 mt-2">
          {collectionName && collectionColor && (
            <CollectionPill name={collectionName} color={collectionColor} />
          )}
          {link.tags.slice(0, 2).map((t) => (
            <span
              key={t.id}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cream-200 dark:bg-ink-800 text-ink-950/60 dark:text-cream-100/60"
            >
              #{t.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
