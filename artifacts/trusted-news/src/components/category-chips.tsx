import { cn } from "@/lib/utils";
import { NEWS_CATEGORIES } from "@/lib/categories";

interface CategoryChipsProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function CategoryChips({ value, onChange, className }: CategoryChipsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 py-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors hover-elevate",
          value === null
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-muted-foreground border-border",
        )}
      >
        الكل
      </button>
      {NEWS_CATEGORIES.map((cat) => {
        const active = value === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(active ? null : cat.value)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors hover-elevate",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border",
            )}
          >
            <span aria-hidden>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
