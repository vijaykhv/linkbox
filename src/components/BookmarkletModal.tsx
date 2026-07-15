import { useEffect, useRef } from "react";

interface BookmarkletModalProps {
  open: boolean;
  onClose: () => void;
}

function buildBookmarklet(): string {
  const origin = window.location.origin;
  const code = `(function(){var u=encodeURIComponent(location.href),t=encodeURIComponent(document.title);window.open('${origin}/?save=1&url='+u+'&title='+t,'linkbox_save','width=420,height=600,menubar=no,toolbar=no,location=no,status=no');})();`;
  return `javascript:${encodeURIComponent(code)}`;
}

export default function BookmarkletModal({ open, onClose }: BookmarkletModalProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const href = buildBookmarklet();

  useEffect(() => {
    // React 19 sanitizes href="javascript:..." passed as a JSX prop (it swaps in a
    // decoy that throws "React has blocked a javascript: URL..."), which breaks the
    // one legitimate use case for that pattern: bookmarklets. Setting the attribute
    // imperatively bypasses React's prop diffing entirely, so the real code survives
    // being dragged out to the bookmarks bar.
    if (open && anchorRef.current) {
      anchorRef.current.setAttribute("href", href);
    }
  }, [open, href]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-ink-900 p-5 animate-pop-in pop-border pop-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-extrabold text-ink-950 dark:text-cream-50">
          Save from anywhere
        </h3>
        <p className="text-sm font-medium text-ink-950/50 dark:text-cream-100/50 mt-1">
          Drag this button to your browser's bookmarks bar. Then, on any page you want to save,
          just click it — one tap and it's in Linkbox.
        </p>

        <div className="flex justify-center my-5">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            ref={anchorRef}
            onClick={(e) => e.preventDefault()}
            draggable
            className="inline-flex items-center gap-2 rounded-xl bg-amber-300 text-ink-950 text-sm font-extrabold px-4 py-2.5 cursor-grab active:cursor-grabbing select-none pop-border pop-shadow"
          >
            🔖 Save to Linkbox
          </a>
        </div>

        <details className="text-xs text-ink-950/50 dark:text-cream-100/50">
          <summary className="cursor-pointer font-bold text-ink-950/70 dark:text-cream-100/70">
            Bookmarks bar not visible, or on mobile?
          </summary>
          <div className="mt-2 space-y-2 font-medium">
            <p>
              <strong>Desktop:</strong> show the bookmarks bar first (Cmd/Ctrl+Shift+B in Chrome),
              then drag the button above onto it.
            </p>
            <p>
              <strong>No drag-and-drop / mobile:</strong> create a new bookmark manually named
              "Save to Linkbox" and paste this as the URL:
            </p>
            <textarea
              readOnly
              value={href}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              rows={3}
              className="w-full rounded-lg bg-cream-100 dark:bg-ink-800 px-2 py-1.5 text-[11px] font-mono outline-none resize-none pop-border"
            />
          </div>
        </details>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-sm font-bold text-ink-950/40 dark:text-cream-100/40 mt-5 hover:text-ink-950/70 dark:hover:text-cream-100/70 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
