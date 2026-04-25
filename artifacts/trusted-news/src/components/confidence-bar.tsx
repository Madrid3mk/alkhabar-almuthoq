import { cn } from "@/lib/utils";
import { Confidence, NewsStatus } from "@workspace/api-client-react";
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type NewsTierKey = "true" | "reliable" | "unverified" | "misleading";

export interface NewsTier {
  key: NewsTierKey;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
  badgeClass: string;
  iconColor: string;
  ringColor: string;
}

export function getNewsTier(input: {
  confidence: Confidence;
  score: number;
  status?: NewsStatus;
}): NewsTier {
  const { score, status } = input;

  if (status === NewsStatus.rejected || score < 40) {
    return {
      key: "misleading",
      label: "خبر مضلل",
      shortLabel: "مضلل",
      Icon: XCircle,
      badgeClass:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900",
      iconColor: "text-rose-600 dark:text-rose-300",
      ringColor: "ring-rose-200 dark:ring-rose-900",
    };
  }

  if (status === NewsStatus.verified && score >= 80) {
    return {
      key: "true",
      label: "خبر صحيح",
      shortLabel: "صحيح",
      Icon: ShieldCheck,
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
      iconColor: "text-emerald-600 dark:text-emerald-300",
      ringColor: "ring-emerald-200 dark:ring-emerald-900",
    };
  }

  if (score >= 65) {
    return {
      key: "reliable",
      label: "خبر يمكن الأخذ به",
      shortLabel: "موثوق نسبياً",
      Icon: CheckCircle2,
      badgeClass:
        "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900",
      iconColor: "text-sky-600 dark:text-sky-300",
      ringColor: "ring-sky-200 dark:ring-sky-900",
    };
  }

  return {
    key: "unverified",
    label: "خبر غير مؤكد",
    shortLabel: "غير مؤكد",
    Icon: AlertTriangle,
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
    iconColor: "text-amber-600 dark:text-amber-300",
    ringColor: "ring-amber-200 dark:ring-amber-900",
  };
}

interface ConfidenceBarProps {
  confidence: Confidence;
  score: number;
  status?: NewsStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceBar({
  confidence,
  score,
  status,
  className,
  size = "md",
}: ConfidenceBarProps) {
  const tier = getNewsTier({ confidence, score, status });
  const Icon = tier.Icon;

  const sizing =
    size === "lg"
      ? "px-4 py-2 text-sm gap-2.5"
      : size === "sm"
        ? "px-2.5 py-1 text-[11px] gap-1.5"
        : "px-3 py-1.5 text-xs gap-2";
  const iconSize =
    size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-bold w-fit",
        tier.badgeClass,
        sizing,
        className,
      )}
    >
      <Icon className={cn(iconSize, tier.iconColor)} />
      <span>{tier.label}</span>
    </div>
  );
}

export const ConfidenceBadge = ConfidenceBar;
