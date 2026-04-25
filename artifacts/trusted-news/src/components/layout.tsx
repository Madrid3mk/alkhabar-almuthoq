import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, Plus, Library, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const leftTabs = [
    { name: "الرئيسية", path: "/", icon: Home },
    { name: "بحث", path: "/search", icon: Search },
  ];
  const rightTabs = [
    { name: "المصادر", path: "/sources", icon: Library },
    { name: "الملف", path: "/me", icon: User },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    if (path === "/me") return location === "/me" || location.startsWith("/u/");
    return location === path || location.startsWith(path + "/");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground pb-20 md:pb-0">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-2xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              خ
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              الخبر الموثوق
            </span>
          </div>
          <Link
            href="/search"
            aria-label="بحث"
            className={cn(
              "md:hidden w-9 h-9 rounded-full flex items-center justify-center hover-elevate",
              isActive("/search")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground",
            )}
          >
            <Search className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl mx-auto p-4 w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 flex items-center justify-around h-16 px-2 safe-area-bottom">
        {leftTabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full text-[11px] font-semibold gap-1",
              isActive(tab.path) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </Link>
        ))}

        <div className="relative -top-5">
          <Link
            href="/submit"
            aria-label="نشر خبر"
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover-elevate ring-4 ring-background",
              isActive("/submit") && "ring-primary/30",
            )}
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>

        {rightTabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full text-[11px] font-semibold gap-1",
              isActive(tab.path) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop floating publish button */}
      <div className="hidden md:flex fixed right-4 bottom-4">
        <Link
          href="/submit"
          aria-label="نشر خبر"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover-elevate"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
