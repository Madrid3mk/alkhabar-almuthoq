import { useState } from "react";
import { Link } from "wouter";
import { useListSources, ListSourcesType, getListSourcesQueryKey } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShieldCheck } from "lucide-react";
import { formatArabicNumber } from "@/lib/format";
import { motion } from "framer-motion";

export default function Sources() {
  const [activeTab, setActiveTab] = useState<ListSourcesType>(ListSourcesType.trusted);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: sources, isLoading } = useListSources(
    { type: activeTab, q: searchQuery || undefined },
    { query: { queryKey: getListSourcesQueryKey({ type: activeTab, q: searchQuery || undefined }) } }
  );

  return (
    <div className="flex flex-col gap-6 py-4 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">سجل المصادر</h1>
        <p className="text-muted-foreground text-sm">قاعدة بيانات المصادر المعتمدة ومستوى دقتها</p>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="ابحث عن مصدر..." 
          className="pl-4 pr-10 bg-muted/50 border-border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue={ListSourcesType.trusted} value={activeTab} onValueChange={(v) => setActiveTab(v as ListSourcesType)}>
        <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1">
          <TabsTrigger value={ListSourcesType.trusted} className="text-xs sm:text-sm">الموثوقة</TabsTrigger>
          <TabsTrigger value={ListSourcesType.newspapers} className="text-xs sm:text-sm">الصحف</TabsTrigger>
          <TabsTrigger value={ListSourcesType.channels} className="text-xs sm:text-sm">القنوات</TabsTrigger>
          <TabsTrigger value={ListSourcesType.websites} className="text-xs sm:text-sm">المواقع</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : sources?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">لا توجد مصادر مطابقة</div>
        ) : (
          sources?.map((source, idx) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/sources/${source.id}`}>
                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center font-bold text-lg text-muted-foreground border border-border shrink-0">
                    {source.name.substring(0, 1)}
                  </div>
                  
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">{source.name}</span>
                      {source.verified && <ShieldCheck className="w-4 h-4 text-trust-blue" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{source.type}</span>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 w-20">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-lg leading-none">{formatArabicNumber(source.score)}</span>
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all" 
                        style={{ 
                          width: `${source.score}%`,
                          backgroundColor: source.score >= 80 ? 'var(--color-trust-green)' : source.score >= 50 ? 'var(--color-trust-amber)' : 'var(--color-trust-red)'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
