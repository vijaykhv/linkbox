import { useState, type FormEvent } from "react";
import { fetchLinkMetadata } from "../lib/metadata";
import { normalizeUrl } from "../lib/url";
import { useToast } from "../context/ToastContext";

interface AddLinkBarProps {
  activeCollectionId: string | null;
  onCreate: (input: {
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

export default function AddLinkBar({
  activeCollectionId,
  onCreate,
  onMetadataResolved,
}: AddLinkBarProps) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const url = normalizeUrl(value);
    if (!url) {
      show("That doesn't look like a valid URL", "error");
      return;
    }
    setSaving(true);
    setValue("");
    try {
      const created = await onCreate({ url, collection_id: activeCollectionId });
      show("Link saved", "success");
      fetchLinkMetadata(url).then((meta) => {
        if (meta) {
          onMetadataResolved(created.id, {
            title: meta.title,
            description: meta.description,
            thumbnail_url: meta.thumbnail_url,
          });
        }
      });
    } catch {
      show("Couldn't save that link", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5">
      <div className="relative flex-1">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-950/40 dark:text-cream-100/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5"
          />
        </svg>
        <input
          type="text"
          inputMode="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste a link to save it…"
          className="w-full rounded-full bg-white dark:bg-ink-900 pl-11 pr-3.5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 transition-shadow placeholder:text-ink-950/35 dark:placeholder:text-cream-100/35 pop-border pop-shadow-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving || !value.trim()}
        className="shrink-0 rounded-full bg-amber-300 disabled:opacity-40 text-ink-950 text-sm font-extrabold px-6 py-3 pop-border pop-shadow pop-press"
      >
        Save
      </button>
    </form>
  );
}
