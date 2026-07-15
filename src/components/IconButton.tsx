interface IconButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "default" | "accent";
}

export default function IconButton({ icon, label, onClick, variant = "default" }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center text-lg pop-border pop-shadow-sm pop-press transition-colors ${
        variant === "accent"
          ? "bg-amber-300 text-ink-950"
          : "bg-white dark:bg-ink-900 text-ink-950 dark:text-cream-50"
      }`}
    >
      {icon}
    </button>
  );
}
