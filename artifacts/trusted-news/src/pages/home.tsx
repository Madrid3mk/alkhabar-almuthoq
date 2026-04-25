import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListNews, Feed } from "@workspace/api-client-react";
import { NewsCard } from "@/components/news-card";
import { CategoryChips } from "@/components/category-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Feed>(Feed.for_you);
  const [category, setCategory] = useState<string | null>(null);

  const { data: news, isLoading } = useListNews(
    { feed: activeTab, category: category ?? undefined },
    {
      query: {
        queryKey: ["/api/news", { feed: activeTab, category }],
      },
    },
  );

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">آخر الأخبار</h1>
      </div>

      <Tabs
        defaultValue={Feed.for_you}
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Feed)}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0 h-auto">
          <TabsTrigger
            value={Feed.for_you}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            لك
          </TabsTrigger>
          <TabsTrigger
            value={Feed.important}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            أهم الأخبار
          </TabsTrigger>
          <TabsTrigger
            value={Feed.local}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            محلي
          </TabsTrigger>
          <TabsTrigger
            value={Feed.world}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            دولي
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
            <p className="text-base">لا توجد أخبار في هذا التصنيف حالياً</p>
            {category && (
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="text-primary text-sm font-bold hover:underline"
              >
                عرض كل التصنيفات
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
  );
}
