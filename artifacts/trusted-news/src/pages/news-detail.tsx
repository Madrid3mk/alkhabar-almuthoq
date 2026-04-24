import { useState } from "react";
import { useLocation } from "wouter";
import { useGetNews, useToggleLike, getGetNewsQueryKey, getListNewsQueryKey, useListComments, Comment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceBar } from "@/components/confidence-bar";
import { formatTimeAgo, formatCompactArabicNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Share2, ThumbsUp, MessageSquare, ArrowRight, ExternalLink, Info, CheckCircle2, XCircle, ShieldAlert, ShieldX } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function NewsDetail({ id }: { id: string }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: news, isLoading } = useGetNews(id, { query: { enabled: !!id, queryKey: getGetNewsQueryKey(id) } });
  const { data: comments, isLoading: isCommentsLoading } = useListComments(id, { query: { enabled: !!id, queryKey: [`/api/news/${id}/comments`] } });
  
  const toggleLike = useToggleLike({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNewsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
        <p>لم يتم العثور على الخبر</p>
        <Button variant="outline" onClick={() => setLocation("/")}>العودة للرئيسية</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <StatusBadge status={news.status} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-primary">{news.category}</span>
          <span>•</span>
          <span>{formatTimeAgo(news.publishedAt)}</span>
          {news.location && (
            <>
              <span>•</span>
              <span>{news.location}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          {news.title}
        </h1>

        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border">
          <Link href={`/u/${news.author.id}`} className="flex items-center gap-3 group">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={news.author.avatarUrl} />
              <AvatarFallback>{news.author.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold group-hover:text-primary transition-colors">{news.author.name}</span>
                {news.author.tier !== "regular" && (
                  <ShieldCheck className="w-4 h-4 text-trust-blue" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">@{news.author.handle}</span>
            </div>
          </Link>
          <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-medium">متابعة</Button>
        </div>
      </div>

      {news.imageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted border border-border">
          <img 
            src={news.imageUrl} 
            alt={news.title} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}

      {news.isRumorCheck && (
        <div
          className={cn(
            "rounded-xl border p-5 flex flex-col gap-4",
            news.rumorVerdict === "true_claim"
              ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
              : news.rumorVerdict === "partly_true"
                ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                : "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900",
          )}
        >
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            {news.rumorVerdict === "true_claim" ? (
              <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
            ) : news.rumorVerdict === "partly_true" ? (
              <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            ) : (
              <ShieldX className="w-5 h-5 text-rose-700 dark:text-rose-300" />
            )}
            <span
              className={cn(
                news.rumorVerdict === "true_claim"
                  ? "text-emerald-800 dark:text-emerald-200"
                  : news.rumorVerdict === "partly_true"
                    ? "text-amber-800 dark:text-amber-200"
                    : "text-rose-800 dark:text-rose-200",
              )}
            >
              تفنيد إشاعة
            </span>
          </div>

          {news.rumorClaim && (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-muted-foreground font-semibold">
                الإشاعة المتداولة
              </div>
              <blockquote className="text-base leading-relaxed border-r-4 border-muted-foreground/30 pr-3 italic">
                «{news.rumorClaim}»
              </blockquote>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="text-xs text-muted-foreground font-semibold">
              الحكم بعد التحقق
            </div>
            <div className="flex items-center gap-2 text-base font-semibold">
              {news.rumorVerdict === "true_claim" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تبيّن أن ما يُعدّ إشاعة هو خبر صحيح فعلاً</span>
                </>
              ) : news.rumorVerdict === "partly_true" ? (
                <>
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>الإشاعة صحيحة جزئياً وفقاً للمصادر</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>الإشاعة كاذبة، وقد فنّدتها المصادر الرسمية</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Summary Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            نتيجة التحقق
          </h3>
          <Link href={`/news/${news.id}/explain`}>
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-8">
              التفاصيل <ArrowRight className="w-3 h-3 rotate-180" />
            </Button>
          </Link>
        </div>

        <ConfidenceBar confidence={news.confidence} score={news.confidenceScore} />

        <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed border border-border/50">
          <p className="flex gap-2">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <span>{news.aiExplanation.verdict}</span>
          </p>
        </div>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed">
        {news.body.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* Sources Section — every URL the author submitted, shown as-is */}
      {news.citations && news.citations.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              المصادر المرجعية ({news.sourcesCount})
            </h3>
            <span className="text-xs text-muted-foreground">
              اضغط على أي مصدر لفتح الرابط الأصلي
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {news.citations.map((c, idx) => {
              const src = c.source;
              const initial = src ? src.name.substring(0, 1) : (c.domain ?? "?").substring(0, 1).toUpperCase();
              return (
                <div
                  key={`${c.url}-${idx}`}
                  className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded flex items-center justify-center font-bold border shrink-0",
                        src ? "bg-muted text-muted-foreground border-border" : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                      )}>
                        {initial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {src ? (
                            <Link href={`/sources/${src.id}`} className="font-medium hover:text-primary transition-colors">
                              {src.name}
                            </Link>
                          ) : (
                            <span className="font-medium text-foreground">{c.domain ?? "مصدر غير معرّف"}</span>
                          )}
                          {src?.verified && <ShieldCheck className="w-3.5 h-3.5 text-trust-blue" />}
                          {!src && (
                            <span className="text-[10px] uppercase tracking-wide bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded">
                              مصدر غير مُسجَّل
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          {src ? src.type : c.domain}
                        </span>
                      </div>
                    </div>
                    {src && (
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-[10px] text-muted-foreground">درجة الدقة</span>
                        <span className="text-sm font-bold">{src.score}%</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-muted/40 border border-border/60 text-xs hover:bg-muted hover:border-primary/40 transition-colors group"
                    dir="ltr"
                  >
                    <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">
                      {c.url}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium shrink-0" dir="rtl">
                      <span>تفقّد المصدر</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claims Breakdown */}
      {news.claims && news.claims.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          <h3 className="text-xl font-bold">تحليل الادعاءات</h3>
          <div className="flex flex-col gap-3">
            {news.claims.map((claim, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                {claim.supported ? (
                  <CheckCircle2 className="w-5 h-5 text-trust-green shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-trust-red shrink-0 mt-0.5" />
                )}
                <span className="text-sm leading-relaxed">{claim.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Action Bar */}
      <div className="flex items-center justify-between sticky bottom-16 md:bottom-4 bg-background/95 backdrop-blur py-3 border-t border-border -mx-4 px-4 safe-area-bottom z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full gap-2 px-4 shadow-sm"
            onClick={() => toggleLike.mutate({ id })}
            disabled={toggleLike.isPending}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{formatCompactArabicNumber(news.stats.likes)}</span>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2 px-4 shadow-sm">
            <MessageSquare className="w-4 h-4" />
            <span>{formatCompactArabicNumber(news.stats.comments)}</span>
          </Button>
        </div>
        <Button variant="secondary" size="icon" className="rounded-full shadow-sm">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Comments Section */}
      <div className="flex flex-col gap-6 mt-6">
        <h3 className="text-xl font-bold">التعليقات</h3>
        
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarFallback>أن</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex flex-col gap-2">
            <textarea 
              className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm" 
              placeholder="أضف تعليقاً..."
            />
            <div className="flex justify-end">
              <Button size="sm">إرسال</Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 mt-4">
          {isCommentsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : comments?.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground text-sm">
               لا توجد تعليقات بعد. كن أول من يعلق!
             </div>
          ) : (
            comments?.map((comment: Comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={comment.author.avatarUrl} />
                  <AvatarFallback>{comment.author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{comment.author.name}</span>
                      {comment.author.tier !== "regular" && <ShieldCheck className="w-3.5 h-3.5 text-trust-blue" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm bg-muted/40 p-3 rounded-lg rounded-tr-none border border-border/50 leading-relaxed mt-1">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
