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
  onTogglePin: (id: string, pinned: boolean) => Promise<void>;
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
  onTogglePin,
}: LinkDetailModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pinning, setPinning] = useState(false);

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
          className="w-full sm:max-w-lg max-h-[92svh] overflow-y-auto bg-white dark:bg-ink-900 sm:rounded-2xl rounded-t-2xl animate-slide-up pop-border pop-shadow"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="aspect-[16/7] bg-cream-200 dark:bg-ink-800 relative border-b-2 border-ink-950 dark:border-cream-100/85">
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
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white text-ink-950 flex items-center justify-center transition-colors pop-border pop-shadow-sm pop-press"
              aria-label="Close"
            >
              ✕
            </button>
            <button
              type="button"
              disabled={pinning}
              onClick={async () => {
                setPinning(true);
                try {
                  await onTogglePin(link!.id, !link!.pinned);
                } finally {
                  setPinning(false);
                }
              }}
              className={`absolute top-3 left-3 h-8 w-8 rounded-full flex items-center justify-center transition-colors pop-border pop-shadow-sm pop-press disabled:opacity-50 ${
                link.pinned ? "bg-amber-300 text-ink-950" : "bg-white text-ink-950"
              }`}
              aria-label={link.pinned ? "Unpin link" : "Pin link"}
              aria-pressed={link.pinned}
            >
              📌
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline break-all"
              >
                {link.url} ↗
              </a>
              <p className="text-xs font-medium text-ink-950/40 dark:text-cream-100/40 mt-0.5">
                Saved {new Date(link.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })} · {hostname(link.url)}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-950/60 dark:text-cream-100/60 mb-1 block">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 pop-border"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-950/60 dark:text-cream-100/60 mb-1 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 resize-none pop-border"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-950/60 dark:text-cream-100/60 mb-1 block">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add a private note…"
                className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 resize-none pop-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink-950/60 dark:text-cream-100/60 mb-1 block">
                  Collection
                </label>
                <select
                  value={collectionId ?? ""}
                  onChange={(e) => setCollectionId(e.target.value || null)}
                  className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 pop-border"
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
                <label className="text-xs font-bold text-ink-950/60 dark:text-cream-100/60 mb-1 block">
                  Tags
                </label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="comma, separated"
                  className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 pop-border"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-bold text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                Delete link
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-sm font-extrabold text-white bg-violet-500 disabled:opacity-50 px-4 py-2 rounded-xl pop-border pop-shadow-sm pop-press"
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
