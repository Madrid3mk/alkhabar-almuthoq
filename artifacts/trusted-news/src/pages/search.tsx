import { useEffect, useMemo, useState } from "react";
import { useListNews } from "@workspace/api-client-react";
import { NewsCard } from "@/components/news-card";
import { CategoryChips } from "@/components/category-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, X } from "lucide-react";
import { motion } from "framer-motion";

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const debouncedQuery = useDebounced(query, 300);

  const trimmed = debouncedQuery.trim();
  const hasFilter = trimmed.length > 0 || category !== null;

  const { data: results, isLoading } = useListNews(
    {
      q: trimmed || undefined,
      category: category ?? undefined,
      limit: 30,
    },
    {
      query: {
        enabled: hasFilter,
        queryKey: ["/api/news/search", { q: trimmed, category }],
      },
    },
  );

  const resultCount = useMemo(() => results?.length ?? 0, [results]);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">البحث</h1>
        <p className="text-muted-foreground text-sm">
          ابحث عن أي خبر بالعنوان أو محتوى المقال
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن خبر، عنوان، أو موضوع..."
          autoFocus
          className="w-full bg-card border border-border rounded-xl py-3 pr-10 pl-10 text-base outline-none focus:border-primary transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 left-3 flex items-center text-muted-foreground hover:text-foreground"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <CategoryChips value={category} onChange={setCategory} />

      {!hasFilter ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
          <SearchIcon className="w-12 h-12 opacity-30" />
          <p className="text-base">ابحث عن أي خبر</p>
          <p className="text-xs">
            اكتب كلمة في صندوق البحث أو اختر تصنيفاً من الأعلى
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : resultCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
          <p className="text-base">لا توجد نتائج مطابقة</p>
          {trimmed && (
            <p className="text-xs">
              جرّب كلمات أخرى أو غيّر التصنيف
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {resultCount} نتيجة
          </p>
          <div className="flex flex-col gap-4">
            {results?.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <NewsCard news={item} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
