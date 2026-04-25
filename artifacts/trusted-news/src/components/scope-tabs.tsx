import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Globe, MapPin } from "lucide-react";

export type Scope = "local" | "world";

interface ScopeTabsProps {
  value: Scope;
  onChange: (value: Scope) => void;
  className?: string;
}

export function ScopeTabs({ value, onChange, className }: ScopeTabsProps) {
  const { t } = useI18n();

  const options: { value: Scope; label: string; icon: typeof MapPin }[] = [
    { value: "local", label: t("home.scope.local"), icon: MapPin },
    { value: "world", label: t("home.scope.world"), icon: Globe },
  ];

  return (
    <div
      className={cn(
        "flex bg-muted/60 rounded-full p-1 w-full max-w-xs",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-sm font-bold transition-all",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <opt.icon className="w-4 h-4" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
