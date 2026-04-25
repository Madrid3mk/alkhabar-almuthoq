import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const STORAGE_KEY = "trusted-news.lang";

type Dict = Record<string, string>;

const ar: Dict = {
  "app.name": "الخبر الموثوق",
  "nav.home": "الرئيسية",
  "nav.search": "البحث",
  "nav.profile": "الملف",
  "nav.sources": "المصادر",
  "nav.submit": "نشر",
  "nav.settings": "الإعدادات",
  "home.title": "آخر الأخبار",
  "home.scope.local": "محلي",
  "home.scope.world": "عالمي",
  "home.openReels": "وضع التقليب",
  "home.refresh": "تحديث",
  "home.empty": "لا توجد أخبار في هذا التصنيف حالياً",
  "home.showAll": "عرض كل التصنيفات",
  "chips.all": "الكل",
  "search.title": "البحث",
  "search.subtitle": "ابحث عن أي خبر بالعنوان أو محتوى المقال",
  "search.placeholder": "ابحث عن خبر، عنوان، أو موضوع...",
  "search.empty": "ابحث عن أي خبر",
  "search.hint": "اكتب كلمة في صندوق البحث أو اختر تصنيفاً من الأعلى",
  "search.noResults": "لا توجد نتائج مطابقة",
  "search.tryOther": "جرّب كلمات أخرى أو غيّر التصنيف",
  "search.results": "نتيجة",
  "settings.title": "الإعدادات",
  "settings.appearance": "المظهر",
  "settings.theme": "السمة",
  "settings.theme.light": "فاتح",
  "settings.theme.dark": "داكن",
  "settings.language": "اللغة",
  "settings.language.ar": "العربية",
  "settings.language.en": "English",
  "settings.about": "حول التطبيق",
  "settings.version": "الإصدار",
  "reels.swipeHint": "اسحب للأعلى للخبر التالي",
  "reels.openFull": "اقرأ المقال كاملاً",
  "ptr.pull": "اسحب للتحديث",
  "ptr.release": "حرّر للتحديث",
  "ptr.loading": "جارٍ التحديث...",
  "category.محلي": "محلية",
  "category.سياسة": "سياسة",
  "category.اقتصاد": "اقتصاد",
  "category.رياضة": "رياضة",
  "category.تقنية": "تقنية",
  "category.صحة": "صحة",
  "category.طقس": "طقس",
  "category.ترفيه": "ترفيه",
  "category.ثقافة": "ثقافة",
  "category.تفنيد إشاعة": "تفنيد إشاعة",
};

const en: Dict = {
  "app.name": "Trusted News",
  "nav.home": "Home",
  "nav.search": "Search",
  "nav.profile": "Profile",
  "nav.sources": "Sources",
  "nav.submit": "Publish",
  "nav.settings": "Settings",
  "home.title": "Latest News",
  "home.scope.local": "Local",
  "home.scope.world": "World",
  "home.openReels": "Reels mode",
  "home.refresh": "Refresh",
  "home.empty": "No news in this category right now",
  "home.showAll": "Show all categories",
  "chips.all": "All",
  "search.title": "Search",
  "search.subtitle": "Find any article by title or body text",
  "search.placeholder": "Search news, title, or topic...",
  "search.empty": "Search any article",
  "search.hint": "Type a keyword or pick a category above",
  "search.noResults": "No matching results",
  "search.tryOther": "Try different words or change the category",
  "search.results": "results",
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.language": "Language",
  "settings.language.ar": "العربية",
  "settings.language.en": "English",
  "settings.about": "About",
  "settings.version": "Version",
  "reels.swipeHint": "Swipe up for the next story",
  "reels.openFull": "Read full article",
  "ptr.pull": "Pull to refresh",
  "ptr.release": "Release to refresh",
  "ptr.loading": "Refreshing...",
  "category.محلي": "Local",
  "category.سياسة": "Politics",
  "category.اقتصاد": "Economy",
  "category.رياضة": "Sports",
  "category.تقنية": "Tech",
  "category.صحة": "Health",
  "category.طقس": "Weather",
  "category.ترفيه": "Entertainment",
  "category.ثقافة": "Culture",
  "category.تفنيد إشاعة": "Fact-check",
};

const dictionaries: Record<Lang, Dict> = { ar, en };

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function readInitial(): Lang {
  if (typeof window === "undefined") return "ar";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "ar" || stored === "en") return stored;
  return "ar";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial);

  useEffect(() => {
    // News content is always Arabic so direction stays RTL — only the chrome
    // text labels swap. This avoids a costly refactor of every physical
    // padding/margin class while still giving a meaningful EN UI.
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  function setLang(next: Lang) {
    setLangState(next);
  }

  function t(key: string, fallback?: string): string {
    return dictionaries[lang][key] ?? fallback ?? key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
