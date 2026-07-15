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
  if (!open) return null;
  const href = buildBookmarklet();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          Save from anywhere
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Drag this button to your browser's bookmarks bar. Then, on any page you want to save,
          just click it — one tap and it's in Linkbox.
        </p>

        <div className="flex justify-center my-5">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href={href}
            onClick={(e) => e.preventDefault()}
            draggable
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white text-sm font-medium px-4 py-2.5 cursor-grab active:cursor-grabbing shadow-lg shadow-violet-600/20 select-none"
          >
            🔖 Save to Linkbox
          </a>
        </div>

        <details className="text-xs text-neutral-500 dark:text-neutral-400">
          <summary className="cursor-pointer font-medium text-neutral-600 dark:text-neutral-300">
            Bookmarks bar not visible, or on mobile?
          </summary>
          <div className="mt-2 space-y-2">
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
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2 py-1.5 text-[11px] font-mono outline-none resize-none"
            />
          </div>
        </details>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-sm text-neutral-400 mt-5 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
