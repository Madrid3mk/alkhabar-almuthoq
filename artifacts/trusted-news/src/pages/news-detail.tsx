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
import { ShieldCheck, Share2, ThumbsUp, MessageSquare, ArrowRight, ExternalLink, Info, CheckCircle2, XCircle } from "lucide-react";
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

      {/* Sources Section */}
      {news.sources && news.sources.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            المصادر المرجعية ({news.sourcesCount})
          </h3>
          <div className="flex flex-col gap-3">
            {news.sources.map((source) => (
              <Link key={source.id} href={`/sources/${source.id}`}>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card hover-elevate">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-bold text-muted-foreground border border-border">
                      {source.name.substring(0, 1)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{source.name}</span>
                        {source.verified && <ShieldCheck className="w-3.5 h-3.5 text-trust-blue" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{source.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">درجة الدقة</span>
                      <span className="text-sm font-bold">{source.score}%</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
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
