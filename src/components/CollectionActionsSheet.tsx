interface CollectionActionsSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectLinks: () => void;
  onCreateSubcollection: () => void;
  onRename: () => void;
  onDelete: () => void;
}

function SheetItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          : "text-ink-950 dark:text-cream-50 hover:bg-cream-200/70 dark:hover:bg-ink-800"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

export default function CollectionActionsSheet({
  open,
  onClose,
  onSelectLinks,
  onCreateSubcollection,
  onRename,
  onDelete,
}: CollectionActionsSheetProps) {
  if (!open) return null;

  function run(action: () => void) {
    onClose();
    action();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm max-h-[80svh] overflow-y-auto bg-white dark:bg-ink-900 rounded-t-2xl animate-slide-up pop-border pop-shadow p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-10 rounded-full bg-cream-300 dark:bg-ink-800 mx-auto my-2" aria-hidden />
        <SheetItem icon="☑️" label="Select Links" onClick={() => run(onSelectLinks)} />
        <div className="h-px bg-cream-200 dark:bg-ink-800 mx-2" />
        <SheetItem icon="📁" label="Create Sub-collection" onClick={() => run(onCreateSubcollection)} />
        <div className="h-px bg-cream-200 dark:bg-ink-800 mx-2" />
        <SheetItem icon="✎" label="Rename Collection" onClick={() => run(onRename)} />
        <SheetItem icon="🗑" label="Delete Collection" danger onClick={() => run(onDelete)} />
      </div>
    </div>
  );
}
