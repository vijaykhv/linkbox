import { useState, type FormEvent } from "react";
import { fetchLinkMetadata } from "../lib/metadata";
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

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
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
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-10 pr-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow placeholder:text-neutral-400"
        />
      </div>
      <button
        type="submit"
        disabled={saving || !value.trim()}
        className="shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:hover:bg-violet-600 active:scale-[0.97] text-white text-sm font-medium px-5 py-3 transition-all shadow-lg shadow-violet-600/20"
      >
        Save
      </button>
    </form>
  );
}
