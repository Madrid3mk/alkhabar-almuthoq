import { useGetSource, getGetSourceQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatArabicNumber } from "@/lib/format";
import { ArrowRight, ShieldCheck, Link as LinkIcon, FileText } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { NewsCard } from "@/components/news-card";

export default function SourceDetail({ id }: { id: string }) {
  const [, setLocation] = useLocation();
  const { data: source, isLoading } = useGetSource(id, {
    query: { enabled: !!id, queryKey: getGetSourceQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!source) {
    return (
      <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
        <p>لم يتم العثور على المصدر</p>
        <Button variant="outline" onClick={() => setLocation("/sources")}>العودة للمصادر</Button>
      </div>
    );
  }

  const chartData = source.accuracyHistory?.map((score, i) => ({
    index: i,
    score
  })) || [];

  return (
    <div className="flex flex-col gap-6 py-4 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/sources")} className="rounded-full">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">تفاصيل المصدر</h1>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6 items-center text-center relative overflow-hidden">
        {source.verified && (
          <div className="absolute top-4 right-4 bg-trust-blue/10 text-trust-blue text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-trust-blue/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            موثق
          </div>
        )}
        
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center font-bold text-3xl text-muted-foreground border border-border shadow-sm">
          {source.name.substring(0, 1)}
        </div>
        
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{source.name}</h2>
          <span className="text-sm text-muted-foreground">{source.type}</span>
        </div>

        <p className="text-sm leading-relaxed max-w-md">{source.bio}</p>

        <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <LinkIcon className="w-4 h-4" />
          زيارة الموقع
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium">مؤشر الدقة</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{formatArabicNumber(source.score)}</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium">الأخبار المنشورة</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{formatArabicNumber(source.articlesCount || 0)}</span>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-muted-foreground">تطور الدقة التاريخي</h3>
          <div className="h-32 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis domain={[0, 100]} hide />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {source.recentNews && source.recentNews.length > 0 && (
        <div className="flex flex-col gap-4 mt-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            أحدث الأخبار
          </h3>
          <div className="flex flex-col gap-4">
            {source.recentNews.map(news => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
