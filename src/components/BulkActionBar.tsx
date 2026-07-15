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
        <div className="flex items-center gap-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-2xl shadow-2xl px-3 py-2 mx-auto w-fit">
          <span className="text-sm font-medium pl-1.5 pr-2.5 whitespace-nowrap">
            {count} selected
          </span>
          <div className="h-5 w-px bg-white/20 dark:bg-neutral-900/20" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoveOpen((o) => !o)}
              className="text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-neutral-900/10 transition-colors"
            >
              Move to…
            </button>
            {moveOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 max-h-64 overflow-y-auto animate-pop-in">
                <button
                  type="button"
                  onClick={() => {
                    onMove(null);
                    setMoveOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
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
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 truncate"
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
            className="text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-neutral-900/10 transition-colors"
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-sm font-medium px-3 py-1.5 rounded-xl text-red-400 dark:text-red-600 hover:bg-white/10 dark:hover:bg-neutral-900/10 transition-colors"
          >
            Delete
          </button>
          <div className="h-5 w-px bg-white/20 dark:bg-neutral-900/20" />
          <button
            type="button"
            onClick={onClear}
            className="text-sm px-2.5 py-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-neutral-900/10 transition-colors opacity-70"
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
