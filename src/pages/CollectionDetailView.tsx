import type { Collection, LinkWithTags, ViewMode } from "../types";
import { getCollectionColor } from "../lib/collectionColor";
import CollectionCard from "../components/CollectionCard";
import IconButton from "../components/IconButton";
import AddLinkBar from "../components/AddLinkBar";
import LinkCard from "../components/LinkCard";
import EmptyState from "../components/EmptyState";

interface CollectionDetailViewProps {
  kind: "collection" | "all" | "unsorted";
  title: string;
  directLinkCount: number;
  subCollections: Collection[];
  countByCollection: Record<string, number>;
  links: LinkWithTags[];
  collectionById: Map<string, Collection>;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  search: string;
  onSearchChange: (v: string) => void;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEnterSelectionMode: (id: string) => void;
  onToggleSelectionMode: () => void;
  loading: boolean;
  onBack: () => void;
  onOpenLink: (id: string) => void;
  onOpenSubCollection: (id: string) => void;
  onOpenMenu?: () => void;
  onSeeHow: () => void;
  addLinkCollectionId: string | null;
  onCreateLink: (input: {
    url: string;
    title?: string | null;
    description?: string | null;
    thumbnail_url?: string | null;
    collection_id?: string | null;
  }) => Promise<{ id: string }>;
  onMetadataResolved: (
    id: string,
    patch: { title?: string | null; description?: string | null; thumbnail_url?: string | null },
  ) => Promise<void>;
}

export default function CollectionDetailView({
  kind,
  title,
  directLinkCount,
  subCollections,
  countByCollection,
  links,
  collectionById,
  view,
  onViewChange,
  search,
  onSearchChange,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onEnterSelectionMode,
  onToggleSelectionMode,
  loading,
  onBack,
  onOpenLink,
  onOpenSubCollection,
  onOpenMenu,
  onSeeHow,
  addLinkCollectionId,
  onCreateLink,
  onMetadataResolved,
}: CollectionDetailViewProps) {
  const subtitle =
    kind === "collection"
      ? `${directLinkCount} link${directLinkCount === 1 ? "" : "s"} · ${subCollections.length} subcollection${subCollections.length === 1 ? "" : "s"}`
      : `${directLinkCount} link${directLinkCount === 1 ? "" : "s"}`;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="sticky top-0 z-20 bg-cream-100/90 dark:bg-ink-950/90 backdrop-blur border-b-2 border-ink-950 dark:border-cream-100/85">
        <div className="flex items-center gap-3 px-4 h-16">
          <IconButton icon="←" label="Back" onClick={onBack} />
          <div className="min-w-0 flex-1 text-center">
            <p className="text-base font-extrabold text-ink-950 dark:text-cream-50 truncate">{title}</p>
            <p className="text-xs font-medium text-ink-950/40 dark:text-cream-100/40 truncate">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
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
            {onOpenMenu && <IconButton icon="⋯" label="Collection menu" onClick={onOpenMenu} />}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-5 pb-28">
          <div className="mb-5">
            <AddLinkBar
              activeCollectionId={addLinkCollectionId}
              onCreate={onCreateLink}
              onMetadataResolved={onMetadataResolved}
            />
          </div>

          <div className="relative mb-5">
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

          {subCollections.length > 0 && (
            <>
              <h2 className="text-xs font-bold uppercase tracking-wide text-ink-950/40 dark:text-cream-100/40 mb-2">
                Sub-collections
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {subCollections.map((c) => (
                  <CollectionCard
                    key={c.id}
                    name={c.name}
                    color={getCollectionColor(c.id)}
                    linkCount={countByCollection[c.id] ?? 0}
                    onOpen={() => onOpenSubCollection(c.id)}
                  />
                ))}
              </div>
            </>
          )}

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-950/40 dark:text-cream-100/40">
              ALL LINKS ({links.length})
            </h2>
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
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
          ) : links.length === 0 ? (
            search.trim() ? (
              <EmptyState icon="🔍" title="No matches" description="Try a different search or filter." />
            ) : (
              <EmptyState
                title="No links yet"
                description="Tap + or share to save one."
                action={
                  <button
                    type="button"
                    onClick={onSeeHow}
                    className="rounded-full bg-amber-300 text-ink-950 text-sm font-extrabold px-5 py-2.5 pop-border pop-shadow-sm pop-press"
                  >
                    See how
                  </button>
                }
              />
            )
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {links.map((link) => {
                const collection = link.collection_id ? collectionById.get(link.collection_id) : null;
                return (
                  <LinkCard
                    key={link.id}
                    link={link}
                    view="grid"
                    selected={selectedIds.has(link.id)}
                    selectionMode={selectionMode}
                    collectionName={kind === "all" ? (collection?.name ?? null) : null}
                    collectionColor={kind === "all" && collection ? getCollectionColor(collection.id) : null}
                    onOpen={() => onOpenLink(link.id)}
                    onToggleSelect={() => onToggleSelect(link.id)}
                    onEnterSelectionMode={() => onEnterSelectionMode(link.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {links.map((link) => {
                const collection = link.collection_id ? collectionById.get(link.collection_id) : null;
                return (
                  <LinkCard
                    key={link.id}
                    link={link}
                    view="list"
                    selected={selectedIds.has(link.id)}
                    selectionMode={selectionMode}
                    collectionName={kind === "all" ? (collection?.name ?? null) : null}
                    collectionColor={kind === "all" && collection ? getCollectionColor(collection.id) : null}
                    onOpen={() => onOpenLink(link.id)}
                    onToggleSelect={() => onToggleSelect(link.id)}
                    onEnterSelectionMode={() => onEnterSelectionMode(link.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
