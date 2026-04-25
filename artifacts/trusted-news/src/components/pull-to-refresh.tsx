import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown> | void;
  children: ReactNode;
  threshold?: number;
}

const MAX_PULL = 120;

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 70,
}: PullToRefreshProps) {
  const { t } = useI18n();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (refreshing) return;
      // Only arm PTR when the user starts at the very top of the page.
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
    function onTouchMove(e: TouchEvent) {
      if (!pulling.current || startY.current === null || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setPullY(0);
        return;
      }
      // Soft resistance — the further you pull, the less responsive.
      const resisted = Math.min(MAX_PULL, dy * 0.5);
      setPullY(resisted);
      if (dy > 8 && window.scrollY === 0) {
        e.preventDefault();
      }
    }
    async function onTouchEnd() {
      if (!pulling.current || refreshing) {
        pulling.current = false;
        return;
      }
      pulling.current = false;
      startY.current = null;
      if (pullY >= threshold) {
        setRefreshing(true);
        setPullY(threshold);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPullY(0);
        }
      } else {
        setPullY(0);
      }
    }
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullY, refreshing, threshold, onRefresh]);

  const showIndicator = pullY > 0 || refreshing;
  const ready = pullY >= threshold;

  return (
    <div className="relative">
      {showIndicator && (
        <div
          className="absolute inset-x-0 -top-2 flex items-center justify-center pointer-events-none z-10"
          style={{ transform: `translateY(${pullY}px)` }}
        >
          <div className="bg-card border border-border shadow-md rounded-full px-3 py-1.5 text-xs font-bold text-muted-foreground flex items-center gap-2">
            {refreshing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t("ptr.loading")}</span>
              </>
            ) : (
              <>
                <ArrowDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    ready ? "rotate-180 text-primary" : ""
                  }`}
                />
                <span>{ready ? t("ptr.release") : t("ptr.pull")}</span>
              </>
            )}
          </div>
        </div>
      )}
      <div
        style={{
          transform: `translateY(${pullY}px)`,
          transition: pulling.current ? "none" : "transform 0.25s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
