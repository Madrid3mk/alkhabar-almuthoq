import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useListNews, type NewsCard as NewsCardType, Feed } from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceBar } from "@/components/confidence-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeAgo, formatCompactArabicNumber } from "@/lib/format";
import {
  X,
  ArrowUp,
  MessageSquare,
  Share2,
  ThumbsUp,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

function useQueryParam(key: string): string | null {
  const [location] = useLocation();
  return useMemo(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return params.get(key);
    // location is included so wouter re-evaluates when the URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, location]);
}

export default function Reels() {
  const { t } = useI18n();
  const scope = useQueryParam("scope") as "local" | "world" | null;
  const category = useQueryParam("category");

  const { data: news, isLoading } = useListNews(
    {
      feed: Feed.for_you,
      scope: scope ?? undefined,
      category: category ?? undefined,
      limit: 30,
    },
    { query: { queryKey: ["/api/news/reels", { scope, category }] } },
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showHint, setShowHint] = useState(true);

  // Track which slide is in view by listening to scroll-snap end.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    function update() {
      if (!el) return;
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setActiveIdx(idx);
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
      if (showHint) setShowHint(false);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [showHint]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white">
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <Link
          href="/"
          aria-label="إغلاق"
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25"
        >
          <X className="w-4 h-4" />
        </Link>
        <span className="text-xs font-bold opacity-80">
          {news ? `${activeIdx + 1} / ${news.length}` : ""}
        </span>
      </div>

      {/* Reels container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapStop: "always" }}
      >
        {isLoading || !news ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : news.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p>{t("home.empty")}</p>
            <Link href="/" className="text-primary font-bold underline">
              {t("home.showAll")}
            </Link>
          </div>
        ) : (
          news.map((item, idx) => (
            <ReelSlide key={item.id} item={item} active={idx === activeIdx} />
          ))
        )}
      </div>

      {/* Swipe hint */}
      {showHint && news && news.length > 1 && (
        <div className="absolute bottom-8 inset-x-0 z-20 flex flex-col items-center gap-1 pointer-events-none animate-bounce">
          <ArrowUp className="w-5 h-5 opacity-80" />
          <span className="text-xs opacity-80 font-semibold">
            {t("reels.swipeHint")}
          </span>
        </div>
      )}
    </div>
  );
}

function ReelSlide({
  item,
  active,
}: {
  item: NewsCardType;
  active: boolean;
}) {
  return (
    <article
      className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden flex flex-col justify-end"
    >
      {/* Background image or gradient */}
      {item.imageUrl ? (
        <>
          <img
            src={item.imageUrl}
            alt={item.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-transform duration-700",
              active ? "scale-105" : "scale-100",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
      )}

      {/* Content overlay */}
      <div className="relative z-10 p-5 pb-24 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="bg-white/15 backdrop-blur rounded-full px-2.5 py-1">
            {item.category}
          </span>
          <span className="opacity-70">{formatTimeAgo(item.publishedAt)}</span>
          <div className="ms-auto">
            <StatusBadge status={item.status} />
          </div>
        </div>

        <h2 className="text-2xl font-bold leading-tight line-clamp-3">
          {item.title}
        </h2>

        <p className="text-white/85 text-sm leading-relaxed line-clamp-4">
          {item.summary}
        </p>

        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
          <ConfidenceBar
            confidence={item.confidence}
            score={item.confidenceScore}
            status={item.status}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/u/${item.author.id}`}
            className="flex items-center gap-2 hover:opacity-90"
          >
            <Avatar className="w-7 h-7 border border-white/20">
              <AvatarImage src={item.author.avatarUrl} />
              <AvatarFallback className="bg-white/15 text-white text-[10px]">
                {item.author.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold">{item.author.name}</span>
            {item.author.tier !== "regular" && (
              <ShieldCheck className="w-3.5 h-3.5 text-trust-blue" />
            )}
          </Link>

          <div className="flex items-center gap-3 text-xs text-white/85">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {formatCompactArabicNumber(item.stats.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {formatCompactArabicNumber(item.stats.comments)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" />
              {formatCompactArabicNumber(item.stats.shares)}
            </span>
          </div>
        </div>

        <Link
          href={`/news/${item.id}`}
          className="self-stretch inline-flex items-center justify-center gap-1.5 mt-1 bg-white text-black font-bold text-sm py-2.5 rounded-xl hover:bg-white/90 transition-colors"
        >
          <span>اقرأ المقال كاملاً</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
