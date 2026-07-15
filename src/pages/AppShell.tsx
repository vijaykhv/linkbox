import { useMemo, useState } from "react";
import { useLinkbox } from "../hooks/useLinkbox";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import AddLinkBar from "../components/AddLinkBar";
import LinkCard from "../components/LinkCard";
import BulkActionBar from "../components/BulkActionBar";
import LinkDetailModal from "../components/LinkDetailModal";
import BackupModal from "../components/BackupModal";
import BookmarkletModal from "../components/BookmarkletModal";
import EmptyState from "../components/EmptyState";
import type { LinkWithTags, LinkboxExport, ViewMode } from "../types";

type CollectionFilter = string | null | "unsorted";

export default function AppShell() {
  const {
    collections,
    tags,
    links,
    loading,
    unsortedCount,
    addLink,
    updateLink,
    setLinkTags,
    deleteLinks,
    moveLinksToCollection,
    addCollection,
    renameCollection,
    deleteCollection,
    exportAll,
    importData,
  } = useLinkbox();
  const { show } = useToast();

  const [activeCollectionId, setActiveCollectionId] = useState<CollectionFilter>(null);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [bookmarkletOpen, setBookmarkletOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);

  const countByCollection = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of links) {
      if (l.collection_id) counts[l.collection_id] = (counts[l.collection_id] ?? 0) + 1;
    }
    return counts;
  }, [links]);

  const filteredLinks = useMemo(() => {
    let result = links;
    if (activeCollectionId === "unsorted") {
      result = result.filter((l) => !l.collection_id);
    } else if (activeCollectionId) {
      result = result.filter((l) => l.collection_id === activeCollectionId);
    }
    if (activeTagId) {
      result = result.filter((l) => l.tags.some((t) => t.id === activeTagId));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((l) =>
        [l.title, l.description, l.url, ...l.tags.map((t) => t.name)]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [links, activeCollectionId, activeTagId, search]);

  const activeLink: LinkWithTags | null = useMemo(
    () => links.find((l) => l.id === activeLinkId) ?? null,
    [links, activeLinkId],
  );

  const title =
    activeCollectionId === null
      ? "All Links"
      : activeCollectionId === "unsorted"
        ? "Unsorted"
        : (collections.find((c) => c.id === activeCollectionId)?.name ?? "Collection");

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function downloadJson(data: LinkboxExport, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-svh overflow-hidden bg-white dark:bg-neutral-950">
      <Sidebar
        collections={collections}
        tags={tags}
        allCount={links.length}
        unsortedCount={unsortedCount}
        countByCollection={countByCollection}
        activeCollectionId={activeCollectionId}
        activeTagId={activeTagId}
        onSelectCollection={(id) => {
          setActiveCollectionId(id);
          setSidebarOpen(false);
        }}
        onSelectTag={setActiveTagId}
        onAddCollection={addCollection}
        onRenameCollection={renameCollection}
        onDeleteCollection={async (id) => {
          if (activeCollectionId === id) setActiveCollectionId(null);
          await deleteCollection(id);
          show("Collection deleted", "success");
        }}
        onOpenBackup={() => setBackupOpen(true)}
        onOpenBookmarklet={() => setBookmarkletOpen(true)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={title}
          search={search}
          onSearchChange={setSearch}
          view={view}
          onViewChange={setView}
          selectionMode={selectionMode}
          onToggleSelectionMode={() => {
            if (selectionMode) exitSelectionMode();
            else setSelectionMode(true);
          }}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-5 pb-28">
            <div className="mb-5">
              <AddLinkBar
                activeCollectionId={
                  activeCollectionId && activeCollectionId !== "unsorted" ? activeCollectionId : null
                }
                onCreate={addLink}
                onMetadataResolved={(id, patch) => updateLink(id, patch)}
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              </div>
            ) : filteredLinks.length === 0 ? (
              links.length === 0 ? (
                <EmptyState
                  title="Nothing saved yet"
                  description="Paste a link above to get started — we'll grab the title and preview for you."
                />
              ) : (
                <EmptyState icon="🔍" title="No matches" description="Try a different search or filter." />
              )
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    view="grid"
                    selected={selectedIds.has(link.id)}
                    selectionMode={selectionMode}
                    onOpen={() => setActiveLinkId(link.id)}
                    onToggleSelect={() => toggleSelect(link.id)}
                    onEnterSelectionMode={() => {
                      setSelectionMode(true);
                      toggleSelect(link.id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    view="list"
                    selected={selectedIds.has(link.id)}
                    selectionMode={selectionMode}
                    onOpen={() => setActiveLinkId(link.id)}
                    onToggleSelect={() => toggleSelect(link.id)}
                    onEnterSelectionMode={() => {
                      setSelectionMode(true);
                      toggleSelect(link.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BulkActionBar
        count={selectedIds.size}
        collections={collections}
        onMove={async (collectionId) => {
          await moveLinksToCollection([...selectedIds], collectionId);
          show(`Moved ${selectedIds.size} link${selectedIds.size === 1 ? "" : "s"}`, "success");
          exitSelectionMode();
        }}
        onDelete={async () => {
          const n = selectedIds.size;
          await deleteLinks([...selectedIds]);
          show(`Deleted ${n} link${n === 1 ? "" : "s"}`, "success");
          exitSelectionMode();
        }}
        onExport={() => {
          const selected = links.filter((l) => selectedIds.has(l.id));
          const data: LinkboxExport = {
            exported_at: new Date().toISOString(),
            version: 1,
            collections: collections.filter((c) => selected.some((l) => l.collection_id === c.id)),
            tags: tags.filter((t) => selected.some((l) => l.tags.some((lt) => lt.id === t.id))),
            links: selected.map(({ tags: linkTags, ...rest }) => ({
              ...rest,
              tag_ids: linkTags.map((t) => t.id),
            })),
          };
          downloadJson(data, `linkbox-selection-${new Date().toISOString().slice(0, 10)}.json`);
          show("Exported selection", "success");
        }}
        onClear={exitSelectionMode}
      />

      <LinkDetailModal
        link={activeLink}
        collections={collections}
        onClose={() => setActiveLinkId(null)}
        onSave={async (id, patch, tagNames) => {
          await updateLink(id, patch);
          await setLinkTags(id, tagNames);
          show("Saved", "success");
        }}
        onDelete={async (id) => {
          await deleteLinks([id]);
          show("Link deleted", "success");
        }}
      />

      <BackupModal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
        onExport={exportAll}
        onImport={importData}
      />

      <BookmarkletModal open={bookmarkletOpen} onClose={() => setBookmarkletOpen(false)} />
    </div>
  );
}
