import { useState } from "react";
import type { Collection } from "../types";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "./ConfirmDialog";

interface ShareCollectionModalProps {
  collection: Collection | null;
  onClose: () => void;
  onToggleShared: (shared: boolean) => Promise<void>;
  onRegenerate: () => Promise<void>;
}

export default function ShareCollectionModal({
  collection,
  onClose,
  onToggleShared,
  onRegenerate,
}: ShareCollectionModalProps) {
  const { show } = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  if (!collection) return null;

  const shareUrl = `${window.location.origin}/?shared=${collection.share_token}`;

  async function toggle(shared: boolean) {
    setBusy(true);
    try {
      await onToggleShared(shared);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    show("Link copied", "success");
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-ink-900 p-5 animate-pop-in pop-border pop-shadow"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-extrabold text-ink-950 dark:text-cream-50">
              Share "{collection.name}"
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-ink-950/50 dark:text-cream-100/50 hover:bg-cream-100 dark:hover:bg-ink-800 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center bg-cream-100 dark:bg-ink-800 rounded-full p-0.5 pop-border mt-4 w-fit">
            <button
              type="button"
              disabled={busy}
              onClick={() => toggle(false)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${
                !collection.is_shared
                  ? "bg-white dark:bg-ink-900 text-ink-950 dark:text-cream-50 pop-shadow-sm"
                  : "text-ink-950/40 dark:text-cream-100/40"
              }`}
            >
              Off
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => toggle(true)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${
                collection.is_shared
                  ? "bg-emerald-300 text-ink-950 pop-shadow-sm"
                  : "text-ink-950/40 dark:text-cream-100/40"
              }`}
            >
              On
            </button>
          </div>

          {collection.is_shared ? (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-medium text-ink-950/50 dark:text-cream-100/50">
                Anyone with this link can view this collection's links — no account needed.
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                  className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3 py-2 text-xs font-medium outline-none pop-border truncate"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-violet-500 pop-border pop-shadow-sm pop-press"
                >
                  Copy
                </button>
              </div>
              {typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={() => navigator.share({ title: collection.name, url: shareUrl })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-bold text-ink-950 dark:text-cream-50 bg-cream-100 dark:bg-ink-800 pop-border pop-shadow-sm pop-press"
                >
                  Share…
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmRegenerate(true)}
                className="text-xs font-bold text-ink-950/40 dark:text-cream-100/40 hover:text-red-600 transition-colors"
              >
                Generate new link
              </button>
            </div>
          ) : (
            <p className="text-xs font-medium text-ink-950/50 dark:text-cream-100/50 mt-4">
              Turn on to generate a public, read-only link anyone can open — no account needed.
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmRegenerate}
        title="Generate a new link?"
        description="The current share link will stop working immediately. Anyone you've already sent it to will need the new one."
        confirmLabel="Generate"
        danger={false}
        onCancel={() => setConfirmRegenerate(false)}
        onConfirm={async () => {
          setConfirmRegenerate(false);
          await onRegenerate();
        }}
      />
    </>
  );
}
