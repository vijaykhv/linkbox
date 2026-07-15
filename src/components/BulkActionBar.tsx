import { useState } from "react";
import type { Collection } from "../types";
import ConfirmDialog from "./ConfirmDialog";

interface BulkActionBarProps {
  count: number;
  collections: Collection[];
  onMove: (collectionId: string | null) => void;
  onDelete: () => void;
  onExport: () => void;
  onClear: () => void;
}

export default function BulkActionBar({
  count,
  collections,
  onMove,
  onDelete,
  onExport,
  onClear,
}: BulkActionBarProps) {
  const [moveOpen, setMoveOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (count === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-slide-up px-4 w-full sm:w-auto">
        <div className="flex items-center gap-1 bg-white dark:bg-ink-900 rounded-full px-3 py-2 mx-auto w-fit pop-border pop-shadow">
          <span className="text-sm font-extrabold pl-1.5 pr-2.5 whitespace-nowrap text-ink-950 dark:text-cream-50">
            {count} selected
          </span>
          <div className="h-5 w-px bg-cream-300 dark:bg-ink-800" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoveOpen((o) => !o)}
              className="text-sm font-bold px-3 py-1.5 rounded-full text-ink-950/70 dark:text-cream-100/70 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
            >
              Move to…
            </button>
            {moveOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-ink-800 text-ink-950 dark:text-cream-100 rounded-xl py-1 max-h-64 overflow-y-auto animate-pop-in pop-border pop-shadow">
                <button
                  type="button"
                  onClick={() => {
                    onMove(null);
                    setMoveOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-cream-100 dark:hover:bg-ink-900"
                >
                  Unsorted
                </button>
                {collections.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onMove(c.id);
                      setMoveOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-cream-100 dark:hover:bg-ink-900 truncate"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onExport}
            className="text-sm font-bold px-3 py-1.5 rounded-full text-ink-950/70 dark:text-cream-100/70 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-sm font-bold px-3 py-1.5 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            Delete
          </button>
          <div className="h-5 w-px bg-cream-300 dark:bg-ink-800" />
          <button
            type="button"
            onClick={onClear}
            className="text-sm px-2.5 py-1.5 rounded-full text-ink-950/40 dark:text-cream-100/40 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${count} link${count === 1 ? "" : "s"}?`}
        description="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          onDelete();
          setConfirmDelete(false);
        }}
      />
    </>
  );
}
