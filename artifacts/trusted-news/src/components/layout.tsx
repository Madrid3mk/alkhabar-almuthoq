import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, User, Settings as SettingsIcon, Plus, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { t } = useI18n();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    if (path === "/me") return location === "/me" || location.startsWith("/u/");
    return location === path || location.startsWith(path + "/");
  };

  // Reels page renders its own fullscreen chrome; hide the app shell entirely.
  if (location === "/reels") {
    return <>{children}</>;
  }

  // Three-tab bottom nav per the user's request: profile, home (for-you),
  // and search. Sources + publish + settings live in the header so they
  // remain reachable without crowding the bottom bar.
  const tabs = [
    { name: t("nav.home"), path: "/", icon: Home },
    { name: t("nav.search"), path: "/search", icon: Search },
    { name: t("nav.profile"), path: "/me", icon: User },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground pb-20 md:pb-0">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-2xl mx-auto flex h-14 items-center justify-between px-4 gap-2">
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-1 -mx-1">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              خ
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              {t("app.name")}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/sources"
              aria-label={t("nav.sources")}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center hover-elevate transition-colors",
                isActive("/sources")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Library className="w-4 h-4" />
            </Link>
            <Link
              href="/submit"
              aria-label={t("nav.submit")}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center hover-elevate transition-colors",
                isActive("/submit")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href="/settings"
              aria-label={t("nav.settings")}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center hover-elevate transition-colors",
                isActive("/settings")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
              )}
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl mx-auto p-4 w-full">
        {children}
      </main>

      {/* Mobile + tablet bottom nav — three primary destinations only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 flex items-center justify-around h-16 px-2 safe-area-bottom">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold gap-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <tab.icon className={cn("w-5 h-5", active && "scale-110 transition-transform")} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop primary nav — same three destinations, shown as a side rail-ish row at top */}
      <nav className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur border border-border rounded-full shadow-lg px-2 py-2 gap-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
