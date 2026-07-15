import { useMemo, useState } from "react";
import { useLinkbox } from "../hooks/useLinkbox";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/Sidebar";
import HomeView from "./HomeView";
import CollectionDetailView from "./CollectionDetailView";
import BulkActionBar from "../components/BulkActionBar";
import LinkDetailModal from "../components/LinkDetailModal";
import BackupModal from "../components/BackupModal";
import BookmarkletModal from "../components/BookmarkletModal";
import CollectionActionsSheet from "../components/CollectionActionsSheet";
import PromptDialog from "../components/PromptDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import type { LinkWithTags, LinkboxExport, ViewMode } from "../types";

type CollectionFilter = string | null | "unsorted" | "all";

type PromptState =
  | { mode: "add-collection" }
  | { mode: "add-subcollection"; parentId: string }
  | { mode: "rename"; targetId: string; initialValue: string };

export default function AppShell() {
  const {
    collections,
    tags,
    links,
    loading,
    unsortedCount,
    addLink,
    updateLink,
    togglePin,
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
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
  const [prompt, setPrompt] = useState<PromptState | null>(null);
  const [deleteCollectionTarget, setDeleteCollectionTarget] = useState<string | null>(null);

  const countByCollection = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of links) {
      if (l.collection_id) counts[l.collection_id] = (counts[l.collection_id] ?? 0) + 1;
    }
    return counts;
  }, [links]);

  const collectionById = useMemo(
    () => new Map(collections.map((c) => [c.id, c])),
    [collections],
  );

  const topLevelCollections = useMemo(
    () => collections.filter((c) => !c.parent_id),
    [collections],
  );

  const childCollections = useMemo(() => {
    const byParent = new Map<string, typeof collections>();
    for (const c of collections) {
      if (!c.parent_id) continue;
      const list = byParent.get(c.parent_id) ?? [];
      list.push(c);
      byParent.set(c.parent_id, list);
    }
    return byParent;
  }, [collections]);

  const kind: "collection" | "all" | "unsorted" =
    activeCollectionId === "all" ? "all" : activeCollectionId === "unsorted" ? "unsorted" : "collection";

  const activeCollection =
    activeCollectionId && activeCollectionId !== "unsorted" && activeCollectionId !== "all"
      ? (collectionById.get(activeCollectionId) ?? null)
      : null;

  const subCollections = activeCollectionId ? (childCollections.get(activeCollectionId) ?? []) : [];

  const filteredLinks = useMemo(() => {
    let result = links;
    if (activeCollectionId === "unsorted") {
      result = result.filter((l) => !l.collection_id);
    } else if (activeCollectionId && activeCollectionId !== "all") {
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
    // Stable sort: pinned links float to the top, otherwise the server's
    // created_at-desc order is preserved within each group.
    return [...result].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [links, activeCollectionId, activeTagId, search]);

  const activeLink: LinkWithTags | null = useMemo(
    () => links.find((l) => l.id === activeLinkId) ?? null,
    [links, activeLinkId],
  );

  const detailTitle =
    activeCollectionId === "all"
      ? "All Links"
      : activeCollectionId === "unsorted"
        ? "Unsorted"
        : (activeCollection?.name ?? "Collection");

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function enterSelectionMode(id: string) {
    setSelectionMode(true);
    toggleSelect(id);
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

  function goBack() {
    exitSelectionMode();
    if (activeCollection?.parent_id) {
      setActiveCollectionId(activeCollection.parent_id);
    } else {
      setActiveCollectionId(null);
    }
  }

  async function handlePromptConfirm(value: string) {
    if (!prompt) return;
    if (prompt.mode === "add-collection") {
      await addCollection(value, null);
    } else if (prompt.mode === "add-subcollection") {
      await addCollection(value, prompt.parentId);
    } else if (prompt.mode === "rename") {
      await renameCollection(prompt.targetId, value);
    }
    setPrompt(null);
  }

  return (
    <div className="flex h-svh overflow-hidden bg-cream-100 dark:bg-ink-950">
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
        onGoHome={() => {
          setActiveCollectionId(null);
          setSidebarOpen(false);
        }}
        onSelectTag={setActiveTagId}
        onAddCollection={(name) => addCollection(name, null)}
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

      {activeCollectionId === null ? (
        <div className="flex-1 overflow-y-auto min-w-0">
          <HomeView
            collections={topLevelCollections}
            countByCollection={countByCollection}
            allCount={links.length}
            unsortedCount={unsortedCount}
            onOpenCollection={(id) => setActiveCollectionId(id)}
            onOpenAll={() => setActiveCollectionId("all")}
            onOpenUnsorted={() => setActiveCollectionId("unsorted")}
            onOpenNewCollection={() => setPrompt({ mode: "add-collection" })}
            onOpenSearch={() => setActiveCollectionId("all")}
            onCreateLink={addLink}
            onMetadataResolved={(id, patch) => updateLink(id, patch)}
          />
        </div>
      ) : (
        <CollectionDetailView
          kind={kind}
          title={detailTitle}
          directLinkCount={filteredLinks.length}
          subCollections={subCollections}
          countByCollection={countByCollection}
          links={filteredLinks}
          collectionById={collectionById}
          view={view}
          onViewChange={setView}
          search={search}
          onSearchChange={setSearch}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onEnterSelectionMode={enterSelectionMode}
          onToggleSelectionMode={() => (selectionMode ? exitSelectionMode() : setSelectionMode(true))}
          loading={loading}
          onBack={goBack}
          onOpenLink={(id) => setActiveLinkId(id)}
          onOpenSubCollection={(id) => setActiveCollectionId(id)}
          onOpenMenu={kind === "collection" ? () => setActionsSheetOpen(true) : undefined}
          onSeeHow={() => setBookmarkletOpen(true)}
          addLinkCollectionId={kind === "collection" ? (activeCollectionId as string) : null}
          onCreateLink={addLink}
          onMetadataResolved={(id, patch) => updateLink(id, patch)}
        />
      )}

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
        onTogglePin={async (id, pinned) => {
          await togglePin(id, pinned);
          show(pinned ? "Pinned" : "Unpinned", "success");
        }}
      />

      <BackupModal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
        onExport={exportAll}
        onImport={importData}
      />

      <BookmarkletModal open={bookmarkletOpen} onClose={() => setBookmarkletOpen(false)} />

      <CollectionActionsSheet
        open={actionsSheetOpen}
        onClose={() => setActionsSheetOpen(false)}
        onSelectLinks={() => setSelectionMode(true)}
        onCreateSubcollection={() =>
          activeCollectionId &&
          activeCollectionId !== "all" &&
          activeCollectionId !== "unsorted" &&
          setPrompt({ mode: "add-subcollection", parentId: activeCollectionId })
        }
        onRename={() =>
          activeCollection && setPrompt({ mode: "rename", targetId: activeCollection.id, initialValue: activeCollection.name })
        }
        onDelete={() => activeCollection && setDeleteCollectionTarget(activeCollection.id)}
      />

      <PromptDialog
        open={prompt !== null}
        title={
          prompt?.mode === "rename"
            ? "Rename collection"
            : prompt?.mode === "add-subcollection"
              ? "New sub-collection"
              : "New collection"
        }
        confirmLabel={prompt?.mode === "rename" ? "Rename" : "Create"}
        initialValue={prompt?.mode === "rename" ? prompt.initialValue : ""}
        placeholder="Collection name"
        onConfirm={handlePromptConfirm}
        onCancel={() => setPrompt(null)}
      />

      <ConfirmDialog
        open={deleteCollectionTarget !== null}
        title="Delete this collection?"
        description="Its links move to Unsorted and any sub-collections are deleted too. This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteCollectionTarget(null)}
        onConfirm={async () => {
          const id = deleteCollectionTarget!;
          setDeleteCollectionTarget(null);
          const parentId = collectionById.get(id)?.parent_id ?? null;
          if (activeCollectionId === id) setActiveCollectionId(parentId);
          await deleteCollection(id);
          show("Collection deleted", "success");
        }}
      />
    </div>
  );
}
