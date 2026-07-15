import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon = "🔖", action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-in">
      <div className="h-16 w-16 rounded-2xl bg-amber-200 flex items-center justify-center text-3xl mb-4 pop-border pop-shadow-sm -rotate-3">
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-ink-950 dark:text-cream-50">{title}</h3>
      <p className="text-sm font-medium text-ink-950/50 dark:text-cream-100/50 mt-1 max-w-xs">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
