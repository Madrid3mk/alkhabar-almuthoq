import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useListNews } from "@workspace/api-client-react";
import { NewsCard } from "@/components/news-card";
import { CategoryChips } from "@/components/category-chips";
import { ScopeTabs, type Scope } from "@/components/scope-tabs";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();
  const [scope, setScope] = useState<Scope>("local");
  const [category, setCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const queryKey = ["/api/news", { scope, category }] as const;

  const { data: news, isLoading, refetch, isFetching } = useListNews(
    { scope, category: category ?? undefined, limit: 30 },
    { query: { queryKey } },
  );

  async function handleRefresh() {
    await queryClient.invalidateQueries({ queryKey });
    await refetch();
  }

  const reelsUrl = `/reels?scope=${scope}${category ? `&category=${encodeURIComponent(category)}` : ""}`;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{t("home.title")}</h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRefresh}
              aria-label={t("home.refresh")}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover-elevate"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
            <Link
              href={reelsUrl}
              aria-label={t("home.openReels")}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold hover-elevate"
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t("home.openReels")}</span>
            </Link>
          </div>
        </div>

        <ScopeTabs value={scope} onChange={setScope} />

        <CategoryChips value={category} onChange={setCategory} />

        <div className="flex flex-col gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border p-4"
              >
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : news?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
              <p className="text-base">{t("home.empty")}</p>
              {category && (
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  {t("home.showAll")}
                </button>
              )}
            </div>
          ) : (
            news?.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NewsCard news={item} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
