import { useState } from "react";
import type { Collection, Tag } from "../types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getCollectionColor } from "../lib/collectionColor";
import ConfirmDialog from "./ConfirmDialog";

interface SidebarProps {
  collections: Collection[];
  tags: Tag[];
  allCount: number;
  unsortedCount: number;
  countByCollection: Record<string, number>;
  activeCollectionId: string | null | "unsorted" | "all";
  activeTagId: string | null;
  onSelectCollection: (id: string | null | "unsorted" | "all") => void;
  onGoHome: () => void;
  onSelectTag: (id: string | null) => void;
  onAddCollection: (name: string) => Promise<unknown>;
  onRenameCollection: (id: string, name: string) => Promise<unknown>;
  onDeleteCollection: (id: string) => Promise<unknown>;
  onOpenBackup: () => void;
  onOpenBookmarklet: () => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  collections,
  tags,
  allCount,
  unsortedCount,
  countByCollection,
  activeCollectionId,
  activeTagId,
  onSelectCollection,
  onGoHome,
  onSelectTag,
  onAddCollection,
  onRenameCollection,
  onDeleteCollection,
  onOpenBackup,
  onOpenBookmarklet,
  open,
  onClose,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) {
      setAdding(false);
      return;
    }
    await onAddCollection(name);
    setNewName("");
    setAdding(false);
  }

  async function handleRename(id: string) {
    const name = editingName.trim();
    if (name) await onRenameCollection(id, name);
    setEditingId(null);
  }

  function renderCollectionTree(parentId: string | null, depth: number) {
    const level = collections.filter((c) => c.parent_id === parentId);
    return level.map((c) => {
      const color = getCollectionColor(c.id);
      return (
        <div key={c.id} style={{ marginLeft: depth * 14 }}>
          {editingId === c.id ? (
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => handleRename(c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(c.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="w-full rounded-lg border border-violet-400 bg-white dark:bg-ink-800 px-2.5 py-2 text-sm outline-none"
            />
          ) : (
            <div className="group relative">
              <SidebarItem
                label={c.name}
                icon={color.emoji}
                chipBg={color.bg}
                count={countByCollection[c.id] ?? 0}
                active={activeCollectionId === c.id}
                onClick={() => onSelectCollection(c.id)}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-0.5 bg-cream-50 dark:bg-ink-900">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(c.id);
                    setEditingName(c.name);
                  }}
                  className="p-1 rounded text-ink-950/40 dark:text-cream-100/40 hover:text-violet-600"
                  aria-label={`Rename ${c.name}`}
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(c)}
                  className="p-1 rounded text-ink-950/40 dark:text-cream-100/40 hover:text-red-600"
                  aria-label={`Delete ${c.name}`}
                >
                  🗑
                </button>
              </div>
            </div>
          )}
          {renderCollectionTree(c.id, depth + 1)}
        </div>
      );
    });
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 shrink-0 bg-cream-50 dark:bg-ink-900 border-r border-cream-300/70 dark:border-ink-800 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2.5 px-4 h-16 shrink-0 border-b border-cream-300/70 dark:border-ink-800">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            aria-label="Go home"
          >
            <div className="h-9 w-9 rounded-2xl bg-violet-500 text-white flex items-center justify-center font-extrabold text-base pop-border pop-shadow-sm">
              L
            </div>
            <span className="font-extrabold text-lg tracking-tight text-ink-950 dark:text-cream-50">
              Linkbox
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto md:hidden p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-ink-800 text-ink-950/50 dark:text-cream-100/50"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-0.5">
            <SidebarItem
              label="All Links"
              icon="📚"
              chipBg="#e9dcff"
              count={allCount}
              active={activeCollectionId === "all"}
              onClick={() => onSelectCollection("all")}
            />
            <SidebarItem
              label="Unsorted"
              icon="📥"
              chipBg="#f9e6c4"
              count={unsortedCount}
              active={activeCollectionId === "unsorted"}
              onClick={() => onSelectCollection("unsorted")}
            />
          </nav>

          <div>
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-950/40 dark:text-cream-100/40">
                Collections
              </span>
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="text-ink-950/40 dark:text-cream-100/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-lg leading-none w-5 h-5 flex items-center justify-center font-bold"
                aria-label="New collection"
              >
                +
              </button>
            </div>
            <div className="space-y-0.5">
              {renderCollectionTree(null, 0)}
              {adding && (
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleAdd}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") {
                      setAdding(false);
                      setNewName("");
                    }
                  }}
                  placeholder="Collection name"
                  className="w-full rounded-lg border border-violet-400 bg-white dark:bg-ink-800 px-2.5 py-2 text-sm outline-none"
                />
              )}
              {collections.length === 0 && !adding && (
                <p className="px-2.5 text-xs text-ink-950/40 dark:text-cream-100/40">
                  No collections yet
                </p>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-ink-950/40 dark:text-cream-100/40 px-2.5 mb-1.5 block">
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5 px-2.5">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTag(activeTagId === t.id ? null : t.id)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full pop-border pop-press transition-colors ${
                      activeTagId === t.id
                        ? "bg-violet-500 text-white pop-shadow-sm"
                        : "bg-white dark:bg-ink-800 text-ink-950/70 dark:text-cream-100/70"
                    }`}
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-cream-300/70 dark:border-ink-800 p-3 space-y-1">
          <button
            type="button"
            onClick={onOpenBookmarklet}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-950/70 dark:text-cream-100/70 hover:bg-cream-200/70 dark:hover:bg-ink-800 transition-colors"
          >
            <span>🔖</span> Save from anywhere
          </button>
          <button
            type="button"
            onClick={onOpenBackup}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-950/70 dark:text-cream-100/70 hover:bg-cream-200/70 dark:hover:bg-ink-800 transition-colors"
          >
            <span>💾</span> Backup & Restore
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-950/70 dark:text-cream-100/70 hover:bg-cream-200/70 dark:hover:bg-ink-800 transition-colors"
          >
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="h-7 w-7 rounded-full bg-violet-200 dark:bg-violet-500/25 text-violet-800 dark:text-violet-300 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.email?.[0].toUpperCase()}
            </div>
            <span className="text-xs text-ink-950/50 dark:text-cream-100/50 truncate flex-1">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs font-medium text-ink-950/40 dark:text-cream-100/40 hover:text-red-600 transition-colors shrink-0"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Its links move to Unsorted and any sub-collections are deleted too. This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await onDeleteCollection(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}

function SidebarItem({
  label,
  icon,
  chipBg,
  count,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  chipBg: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-sm transition-colors ${
        active
          ? "bg-violet-100 dark:bg-violet-500/15 text-violet-800 dark:text-violet-300 font-bold"
          : "text-ink-950/75 dark:text-cream-100/75 font-medium hover:bg-cream-200/70 dark:hover:bg-ink-800"
      }`}
    >
      <span
        className="h-7 w-7 rounded-lg flex items-center justify-center text-sm shrink-0 pop-border pop-shadow-sm"
        style={{ backgroundColor: chipBg }}
      >
        {icon}
      </span>
      <span className="truncate flex-1 text-left">{label}</span>
      {count > 0 && (
        <span
          className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${active ? "bg-violet-200 dark:bg-violet-500/25" : "bg-cream-200 dark:bg-ink-800 text-ink-950/50 dark:text-cream-100/50"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
