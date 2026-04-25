export interface NewsCategory {
  value: string;
  label: string;
  emoji: string;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  { value: "محلي", label: "محلية", emoji: "📍" },
  { value: "سياسة", label: "سياسة", emoji: "🏛️" },
  { value: "اقتصاد", label: "اقتصاد", emoji: "💰" },
  { value: "رياضة", label: "رياضة", emoji: "⚽" },
  { value: "تقنية", label: "تقنية", emoji: "💻" },
  { value: "صحة", label: "صحة", emoji: "🏥" },
  { value: "طقس", label: "طقس", emoji: "🌦️" },
  { value: "ترفيه", label: "ترفيه", emoji: "🎬" },
  { value: "ثقافة", label: "ثقافة", emoji: "📚" },
  { value: "تفنيد إشاعة", label: "تفنيد إشاعة", emoji: "🚫" },
];

export function getCategoryMeta(value: string | undefined | null): NewsCategory | undefined {
  if (!value) return undefined;
  return NEWS_CATEGORIES.find((c) => c.value === value);
}
