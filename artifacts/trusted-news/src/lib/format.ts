import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function formatArabicNumber(num: number): string {
  return num.toLocaleString("ar-EG");
}

export function formatCompactArabicNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + "م";
  }
  if (num >= 1000) {
    return (num / 1000).toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + "أ";
  }
  return num.toLocaleString("ar-EG");
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ar });
  } catch (e) {
    return "";
  }
}
