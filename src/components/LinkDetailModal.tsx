import { useEffect, useState } from "react";
import type { Collection, LinkWithTags } from "../types";
import ConfirmDialog from "./ConfirmDialog";

interface LinkDetailModalProps {
  link: LinkWithTags | null;
  collections: Collection[];
  onClose: () => void;
  onSave: (
    id: string,
    patch: { title?: string | null; description?: string | null; notes?: string | null; collection_id?: string | null },
    tagNames: string[],
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LinkDetailModal({
  link,
  collections,
  onClose,
  onSave,
  onDelete,
}: LinkDetailModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (link) {
      setTitle(link.title ?? "");
      setDescription(link.description ?? "");
      setNotes(link.notes ?? "");
      setCollectionId(link.collection_id);
      setTagsInput(link.tags.map((t) => t.name).join(", "));
    }
  }, [link]);

  if (!link) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(
        link!.id,
        { title: title || null, description: description || null, notes: notes || null, collection_id: collectionId },
        tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      );
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-lg max-h-[92svh] overflow-y-auto bg-white dark:bg-neutral-900 sm:rounded-2xl rounded-t-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="aspect-[16/7] bg-neutral-100 dark:bg-neutral-800 relative">
            {link.thumbnail_url && (
              <img
                src={link.thumbnail_url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline break-all"
              >
                {link.url} ↗
              </a>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                Saved {new Date(link.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })} · {hostname(link.url)}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add a private note…"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
                  Collection
                </label>
                <select
                  value={collectionId ?? ""}
                  onChange={(e) => setCollectionId(e.target.value || null)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Unsorted</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
                  Tags
                </label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="comma, separated"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-medium text-red-600 dark:text-red-400 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                Delete link
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-4 py-2 rounded-xl transition-colors active:scale-[0.97]"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this link?"
        description="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setConfirmDelete(false);
          await onDelete(link!.id);
          onClose();
        }}
      />
    </>
  );
}
