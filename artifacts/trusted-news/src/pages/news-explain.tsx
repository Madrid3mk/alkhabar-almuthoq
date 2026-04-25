import { useGetNews, getGetNewsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Bot, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfidenceBar } from "@/components/confidence-bar";
import { StatusBadge } from "@/components/status-badge";

export default function NewsExplain({ id }: { id: string }) {
  const [, setLocation] = useLocation();
  const { data: news, isLoading } = useGetNews(id, {
    query: { enabled: !!id, queryKey: getGetNewsQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
        <p>لم يتم العثور على التفاصيل</p>
        <Button variant="outline" onClick={() => setLocation("/")}>العودة للرئيسية</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation(`/news/${id}`)} className="rounded-full">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">تفسير الذكاء الاصطناعي</h1>
      </div>

      <div className="flex flex-col gap-4 bg-primary/5 border border-primary/20 p-5 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Bot className="w-5 h-5" />
            قرار النظام
          </div>
          <StatusBadge status={news.status} />
        </div>
        
        <p className="text-sm leading-relaxed font-medium">
          {news.aiExplanation.verdict}
        </p>

        <ConfidenceBar
          confidence={news.confidence}
          score={news.confidenceScore}
          status={news.status}
          className="mt-2"
          size="lg"
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">أسباب التقييم</h2>
        
        <div className="flex flex-col gap-3">
          {news.aiExplanation.reasons.map((reason, idx) => (
            <div key={idx} className="flex gap-3 p-4 bg-card border border-border rounded-xl">
              <div className="shrink-0 mt-0.5">
                {reason.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-trust-green" />
                ) : (
                  <XCircle className="w-5 h-5 text-trust-red" />
                )}
              </div>
              <p className="text-sm leading-relaxed">{reason.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-card border border-border p-5 rounded-xl flex flex-col gap-3">
        <h3 className="font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          كيف يعمل نظام التحقق؟
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          نظام "الخبر الموثوق" يستخدم خوارزميات معالجة اللغة الطبيعية لمقارنة الادعاءات الواردة في الخبر مع قاعدة بياناتنا للمصادر الموثوقة. يتم تقييم كل مصدر بناءً على تاريخه في نقل الأخبار بدقة، وتُحسب النتيجة النهائية كمتوسط مرجح لقوة المصادر وصحة الادعاءات.
        </p>
      </div>

      <Button onClick={() => setLocation(`/news/${id}`)} className="w-full mt-4" size="lg" variant="outline">
        العودة للخبر
      </Button>
    </div>
  );
}
