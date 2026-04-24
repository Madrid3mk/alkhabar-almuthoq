import { Link } from "wouter";
import { formatTimeAgo, formatCompactArabicNumber } from "@/lib/format";
import { NewsCard as NewsCardType } from "@workspace/api-client-react";
import { StatusBadge } from "./status-badge";
import { ConfidenceBar } from "./confidence-bar";
import { MessageSquare, Share2, ThumbsUp, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  news: NewsCardType;
  className?: string;
}

export function NewsCard({ news, className }: NewsCardProps) {
  return (
    <Card className={cn("overflow-hidden flex flex-col transition-all hover:shadow-md", className)}>
      <Link href={`/news/${news.id}`} className="block flex-1">
        {news.imageUrl && (
          <div className="aspect-[2/1] overflow-hidden bg-muted">
            <img 
              src={news.imageUrl} 
              alt={news.title} 
              className="w-full h-full object-cover transition-transform hover:scale-105" 
            />
          </div>
        )}
        
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{news.category}</span>
              <span>•</span>
              <span>{formatTimeAgo(news.publishedAt)}</span>
            </div>
            <StatusBadge status={news.status} />
          </div>

          <h3 className="font-bold text-lg leading-tight line-clamp-2">
            {news.title}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-2">
            {news.summary}
          </p>

          <ConfidenceBar confidence={news.confidence} score={news.confidenceScore} className="mt-2" />
        </div>
      </Link>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
        <Link href={`/u/${news.author.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="w-6 h-6 border border-border">
            <AvatarImage src={news.author.avatarUrl} />
            <AvatarFallback>{news.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">{news.author.name}</span>
            {news.author.tier !== "regular" && (
              <ShieldCheck className="w-3 h-3 text-trust-blue" />
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{formatCompactArabicNumber(news.stats.likes)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{formatCompactArabicNumber(news.stats.comments)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Share2 className="w-3.5 h-3.5" />
            <span>{formatCompactArabicNumber(news.stats.shares)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
