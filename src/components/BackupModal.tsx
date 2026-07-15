import { useRef, useState } from "react";
import type { LinkboxExport } from "../types";
import { useToast } from "../context/ToastContext";

interface BackupModalProps {
  open: boolean;
  onClose: () => void;
  onExport: () => LinkboxExport;
  onImport: (data: LinkboxExport) => Promise<void>;
}

export default function BackupModal({ open, onClose, onExport, onImport }: BackupModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const { show } = useToast();

  if (!open) return null;

  function handleExport() {
    const data = onExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkbox-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show("Backup downloaded", "success");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as LinkboxExport;
      if (!Array.isArray(data.links) || !Array.isArray(data.collections)) {
        throw new Error("Invalid backup file");
      }
      await onImport(data);
      show("Backup restored", "success");
      onClose();
    } catch {
      show("Couldn't read that backup file", "error");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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
          Backup & Restore
        </h3>
        <p className="text-sm font-medium text-ink-950/50 dark:text-cream-100/50 mt-1">
          Download everything as a JSON file, or restore from a previous export. Your data still
          lives in Supabase — this is just a local copy.
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-500 text-white text-sm font-extrabold py-2.5 pop-border pop-shadow-sm pop-press"
          >
            Export all data
          </button>
          <label className="w-full flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-ink-800 text-ink-950 dark:text-cream-100 text-sm font-bold py-2.5 cursor-pointer pop-border pop-shadow-sm pop-press">
            {importing ? "Importing…" : "Import from file"}
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={handleFile}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-sm font-bold text-ink-950/40 dark:text-cream-100/40 mt-4 hover:text-ink-950/70 dark:hover:text-cream-100/70 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
