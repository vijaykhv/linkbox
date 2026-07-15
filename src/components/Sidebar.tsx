import { useState } from "react";
import type { Collection, Tag } from "../types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ConfirmDialog from "./ConfirmDialog";

interface SidebarProps {
  collections: Collection[];
  tags: Tag[];
  allCount: number;
  unsortedCount: number;
  countByCollection: Record<string, number>;
  activeCollectionId: string | null | "unsorted";
  activeTagId: string | null;
  onSelectCollection: (id: string | null | "unsorted") => void;
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

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 shrink-0 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 px-4 h-16 shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          <div className="h-8 w-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-semibold text-sm">
            L
          </div>
          <span className="font-semibold text-neutral-900 dark:text-neutral-50">Linkbox</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto md:hidden p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500"
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
              count={allCount}
              active={activeCollectionId === null}
              onClick={() => onSelectCollection(null)}
            />
            <SidebarItem
              label="Unsorted"
              icon="📥"
              count={unsortedCount}
              active={activeCollectionId === "unsorted"}
              onClick={() => onSelectCollection("unsorted")}
            />
          </nav>

          <div>
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Collections
              </span>
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-lg leading-none w-5 h-5 flex items-center justify-center"
                aria-label="New collection"
              >
                +
              </button>
            </div>
            <div className="space-y-0.5">
              {collections.map((c) =>
                editingId === c.id ? (
                  <input
                    key={c.id}
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRename(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(c.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-full rounded-lg border border-violet-400 bg-white dark:bg-neutral-800 px-2.5 py-2 text-sm outline-none"
                  />
                ) : (
                  <div key={c.id} className="group relative">
                    <SidebarItem
                      label={c.name}
                      icon="📁"
                      count={countByCollection[c.id] ?? 0}
                      active={activeCollectionId === c.id}
                      onClick={() => onSelectCollection(c.id)}
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-0.5 bg-neutral-50 dark:bg-neutral-900">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditingName(c.name);
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-violet-600"
                        aria-label={`Rename ${c.name}`}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="p-1 rounded text-neutral-400 hover:text-red-600"
                        aria-label={`Delete ${c.name}`}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ),
              )}
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
                  className="w-full rounded-lg border border-violet-400 bg-white dark:bg-neutral-800 px-2.5 py-2 text-sm outline-none"
                />
              )}
              {collections.length === 0 && !adding && (
                <p className="px-2.5 text-xs text-neutral-400 dark:text-neutral-500">
                  No collections yet
                </p>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500 px-2.5 mb-1.5 block">
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5 px-2.5">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTag(activeTagId === t.id ? null : t.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      activeTagId === t.id
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-violet-400"
                    }`}
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 space-y-1">
          <button
            type="button"
            onClick={onOpenBookmarklet}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <span>🔖</span> Save from anywhere
          </button>
          <button
            type="button"
            onClick={onOpenBackup}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <span>💾</span> Backup & Restore
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 flex items-center justify-center text-xs font-semibold shrink-0">
              {user?.email?.[0].toUpperCase()}
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex-1">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs text-neutral-400 hover:text-red-600 transition-colors shrink-0"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Links in this collection will move to Unsorted. This can't be undone."
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
  count,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 font-medium"
          : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
      }`}
    >
      <span>{icon}</span>
      <span className="truncate flex-1 text-left">{label}</span>
      {count > 0 && (
        <span
          className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-violet-200 dark:bg-violet-500/25" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
