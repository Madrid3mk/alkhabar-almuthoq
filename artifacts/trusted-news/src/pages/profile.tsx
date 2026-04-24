import { useGetUser, useGetUserNews, useGetMe, getGetUserQueryKey, getGetUserNewsQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, Settings, CheckCircle2, ChevronLeft } from "lucide-react";
import { formatArabicNumber } from "@/lib/format";
import { NewsCard } from "@/components/news-card";

interface ProfileProps {
  id?: string;
  isMe?: boolean;
}

export default function Profile({ id, isMe }: ProfileProps) {
  const [, setLocation] = useLocation();
  
  // If isMe is true, we should theoretically use useGetMe() but for this mockup
  // we'll just use a fixed ID or assume useGetMe returns a user profile.
  // The OpenAPI spec says useGetMe returns UserProfile.
  const meQuery = useGetMe({ query: { enabled: !!isMe, queryKey: getGetMeQueryKey() } });
  const userQuery = useGetUser(id || "", { query: { enabled: !!id && !isMe, queryKey: getGetUserQueryKey(id || "") } });
  
  const user = isMe ? meQuery.data : userQuery.data;
  const isLoading = isMe ? meQuery.isLoading : userQuery.isLoading;

  const resolvedId = user?.id || id || "";
  const { data: news, isLoading: isNewsLoading } = useGetUserNews(resolvedId, {
    query: { enabled: !!resolvedId, queryKey: getGetUserNewsQueryKey(resolvedId) }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
        <p>لم يتم العثور على المستخدم</p>
        <Button variant="outline" onClick={() => setLocation("/")}>العودة للرئيسية</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        {isMe && (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center text-center gap-3">
        <Avatar className="w-24 h-24 border-4 border-background shadow-md">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="text-2xl">{user.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-bold">{user.name}</h2>
            {user.tier !== "regular" && <ShieldCheck className="w-5 h-5 text-trust-blue" />}
          </div>
          <span className="text-muted-foreground dir-ltr">@{user.handle}</span>
        </div>
        {user.bio && (
          <p className="text-sm max-w-sm mt-2">{user.bio}</p>
        )}
        
        <div className="flex gap-6 mt-2 text-sm">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{formatArabicNumber(user.followers || 0)}</span>
            <span className="text-muted-foreground text-xs">متابع</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{formatArabicNumber(user.following || 0)}</span>
            <span className="text-muted-foreground text-xs">يتابع</span>
          </div>
        </div>
      </div>

      {isMe && (
        <Link href="/trust">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors group cursor-pointer hover-elevate">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-trust-blue/10 flex items-center justify-center text-trust-blue">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">مستوى الثقة الحالي</span>
                <span className="text-xs text-muted-foreground">
                  {user.tier === "regular" ? "مساهم عادي" : user.tier === "trusted" ? "مساهم موثوق" : "ناشر معتمد"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-trust-blue transition-all" 
                  style={{ width: `${user.progressToNextTier || 0}%` }} 
                />
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center text-center gap-1">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">مؤشر الدقة</span>
          <span className="text-2xl font-bold">{formatArabicNumber(user.accuracyScore)}%</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center text-center gap-1">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">أخبار صحيحة</span>
          <span className="text-2xl font-bold text-trust-green flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {formatArabicNumber(user.correctCount)}
          </span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center text-center gap-1">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">إجمالي النشر</span>
          <span className="text-2xl font-bold">{formatArabicNumber(user.publishedCount)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <h3 className="font-bold">سجل الأخبار المنشورة</h3>
        {isNewsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : news?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-border border-dashed">
            لا توجد أخبار منشورة
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {news?.map(item => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
