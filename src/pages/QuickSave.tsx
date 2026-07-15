import { useEffect, useState } from "react";
import { useLinkbox } from "../hooks/useLinkbox";
import { fetchLinkMetadata } from "../lib/metadata";
import { normalizeUrl } from "../lib/url";

function getParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

// This page is only ever used for a single save per page load (opened fresh
// by the bookmarklet each time), so a module-level flag is the reliable way
// to dedupe — it survives re-renders and remounts within this page load in
// a way a ref inside the component can't guarantee under StrictMode.
let hasSaved = false;

export default function QuickSave() {
  const { collections, addLink, updateLink, setLinkTags } = useLinkbox();
  const pageTitle = getParam("title");
  const url = normalizeUrl(getParam("url"));

  const [status, setStatus] = useState<"saving" | "saved" | "error">("saving");
  const [linkId, setLinkId] = useState<string | null>(null);
  const [title, setTitle] = useState(pageTitle);
  const [collectionId, setCollectionId] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (hasSaved || !url) return;
    hasSaved = true;
    (async () => {
      try {
        const created = await addLink({ url, title: pageTitle || null });
        setLinkId(created.id);
        setStatus("saved");
        const meta = await fetchLinkMetadata(url);
        if (meta) {
          if (meta.title) setTitle(meta.title);
          await updateLink(created.id, {
            title: meta.title,
            description: meta.description,
            thumbnail_url: meta.thumbnail_url,
          });
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [url, pageTitle, addLink, updateLink]);

  async function applyChangesAndClose() {
    if (linkId) {
      if (collectionId) await updateLink(linkId, { collection_id: collectionId });
      if (tagsInput.trim()) {
        await setLinkTags(
          linkId,
          tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        );
      }
    }
    window.close();
  }

  if (!url) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center px-6 text-center bg-white dark:bg-neutral-950">
        <div className="text-3xl mb-2">⚠️</div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">No link to save.</p>
        <p className="text-xs text-neutral-400 mt-1">Open this via the Linkbox bookmarklet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-8 bg-white dark:bg-neutral-950 text-center">
      {status === "saving" && (
        <>
          <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Saving to Linkbox…</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Couldn't save this link.</p>
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-4 text-sm text-violet-600 dark:text-violet-400 font-medium"
          >
            Close
          </button>
        </>
      )}

      {status === "saved" && (
        <div className="w-full max-w-xs animate-pop-in">
          <div className="h-12 w-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center text-2xl mb-3">
            ✓
          </div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Saved to Linkbox
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mb-5">
            {title || url}
          </p>

          <div className="space-y-2 text-left">
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Unsorted</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tags, comma separated"
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <button
            type="button"
            onClick={applyChangesAndClose}
            className="w-full mt-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 transition-colors active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
