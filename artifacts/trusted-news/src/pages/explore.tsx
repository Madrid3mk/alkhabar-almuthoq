import { useGetDashboardSummary, useGetTrendingNews, getGetDashboardSummaryQueryKey, getGetTrendingNewsQueryKey } from "@workspace/api-client-react";
import { formatArabicNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsCard } from "@/components/news-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, XCircle, FileText, Activity } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = {
  high: "hsl(var(--trust-green))",
  medium: "hsl(var(--trust-amber))",
  low: "hsl(var(--trust-red))",
};

export default function Explore() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });

  const { data: trendingNews, isLoading: isTrendingLoading } = useGetTrendingNews({
    query: { queryKey: getGetTrendingNewsQueryKey() }
  });

  const pieData = summary ? [
    { name: 'عالية', value: summary.trustDistribution.high, color: COLORS.high },
    { name: 'متوسطة', value: summary.trustDistribution.medium, color: COLORS.medium },
    { name: 'منخفضة', value: summary.trustDistribution.low, color: COLORS.low },
  ] : [];

  return (
    <div className="flex flex-col gap-6 py-4 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">استكشاف</h1>
        <p className="text-muted-foreground text-sm">نظرة عامة على نشاط منصة الخبر الموثوق</p>
      </div>

      {isSummaryLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl col-span-2" />
        </div>
      ) : summary ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{formatArabicNumber(summary.totalNews)}</span>
                <span className="text-xs text-muted-foreground">إجمالي الأخبار</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{formatArabicNumber(summary.activePublishers)}</span>
                <span className="text-xs text-muted-foreground">ناشر نشط</span>
              </CardContent>
            </Card>
            <Card className="bg-trust-green/5 border-trust-green/20">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-trust-green" />
                <span className="text-2xl font-bold text-trust-green">{formatArabicNumber(summary.verifiedToday)}</span>
                <span className="text-xs text-trust-green/80">مؤكد اليوم</span>
              </CardContent>
            </Card>
            <Card className="bg-trust-red/5 border-trust-red/20">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <XCircle className="w-5 h-5 text-trust-red" />
                <span className="text-2xl font-bold text-trust-red">{formatArabicNumber(summary.rejectedToday)}</span>
                <span className="text-xs text-trust-red/80">مرفوض اليوم</span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">توزيع الموثوقية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${formatArabicNumber(value)} خبر`, 'العدد']}
                      contentStyle={{ direction: 'rtl', fontFamily: 'inherit', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-xl font-bold">الأخبار الشائعة (مؤكدة)</h2>
        
        {isTrendingLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : trendingNews?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">لا توجد أخبار شائعة حالياً</div>
        ) : (
          <div className="flex flex-col gap-4">
            {trendingNews?.map((news, idx) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <NewsCard news={news} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
