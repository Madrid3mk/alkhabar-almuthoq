import { useTheme } from "@/lib/theme";
import { useI18n, type Lang } from "@/lib/i18n";
import { Sun, Moon, Languages, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const themeOptions: { value: "light" | "dark"; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t("settings.theme.light"), icon: Sun },
    { value: "dark", label: t("settings.theme.dark"), icon: Moon },
  ];

  const langOptions: { value: Lang; label: string }[] = [
    { value: "ar", label: t("settings.language.ar") },
    { value: "en", label: t("settings.language.en") },
  ];

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      {/* Appearance */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          {t("settings.appearance")}
        </h2>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Theme */}
          <div className="p-4 flex flex-col gap-3 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <span>{t("settings.theme")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map((opt) => {
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-colors hover-elevate",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <opt.icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                    {active && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Languages className="w-4 h-4 text-muted-foreground" />
              <span>{t("settings.language")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {langOptions.map((opt) => {
                const active = lang === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLang(opt.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-colors hover-elevate",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <span>{opt.label}</span>
                    {active && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          {t("settings.about")}
        </h2>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-bold">{t("app.name")}</span>
            <span className="text-muted-foreground text-xs">
              {t("settings.version")} 1.0.0
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
