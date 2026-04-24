import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, Plus, Library, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const tabs = [
    { name: "الرئيسية", path: "/", icon: Home },
    { name: "استكشاف", path: "/explore", icon: Compass },
    { name: "المصادر", path: "/sources", icon: Library },
    { name: "الملف", path: "/me", icon: User },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground pb-16 md:pb-0">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-2xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">خ</div>
            <span className="font-bold text-lg hidden sm:inline-block">الخبر الموثوق</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl mx-auto p-4 w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background flex items-center justify-around h-16 px-2 safe-area-bottom">
        {tabs.slice(0, 2).map((tab) => (
          <Link key={tab.path} href={tab.path} className={cn(
            "flex flex-col items-center justify-center w-16 h-full text-xs gap-1",
            location === tab.path ? "text-primary" : "text-muted-foreground"
          )}>
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </Link>
        ))}

        <div className="relative -top-5">
          <Link href="/submit" className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover-elevate">
            <Plus className="w-6 h-6" />
          </Link>
        </div>

        {tabs.slice(2).map((tab) => (
          <Link key={tab.path} href={tab.path} className={cn(
            "flex flex-col items-center justify-center w-16 h-full text-xs gap-1",
            location === tab.path || (location.startsWith("/u/") && tab.path === "/me") ? "text-primary" : "text-muted-foreground"
          )}>
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop Sidebar / Navigation placeholder if needed */}
      <div className="hidden md:flex fixed right-4 bottom-4">
        <Link href="/submit" className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover-elevate">
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
