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
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          Backup & Restore
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Download everything as a JSON file, or restore from a previous export. Your data still
          lives in Supabase — this is just a local copy.
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 transition-colors active:scale-[0.98]"
          >
            Export all data
          </button>
          <label className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium py-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
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
          className="w-full text-center text-sm text-neutral-400 mt-4 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
