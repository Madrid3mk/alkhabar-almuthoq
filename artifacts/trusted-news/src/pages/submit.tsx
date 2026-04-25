import { useState } from "react";
import { useLocation } from "wouter";
import { useSubmitNews } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, X, Upload, ShieldX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NEWS_CATEGORIES } from "@/lib/categories";

export default function Submit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [sourceUrls, setSourceUrls] = useState<string[]>([""]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [isRumorCheck, setIsRumorCheck] = useState(false);
  const [rumorClaim, setRumorClaim] = useState("");
  const [rumorVerdict, setRumorVerdict] = useState<
    "false_rumor" | "true_claim" | "partly_true"
  >("false_rumor");
  
  const submitMutation = useSubmitNews({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "تم إرسال الخبر بنجاح",
          description: "جاري الآن التحقق من صحة المعلومات...",
        });
        setLocation(`/news/${data.id}/verify`);
      },
      onError: () => {
        toast({
          title: "حدث خطأ",
          description: "يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى",
          variant: "destructive"
        });
      }
    }
  });

  const handleAddSource = () => {
    setSourceUrls([...sourceUrls, ""]);
  };

  const handleUpdateSource = (index: number, value: string) => {
    const newSources = [...sourceUrls];
    newSources[index] = value;
    setSourceUrls(newSources);
  };

  const handleRemoveSource = (index: number) => {
    if (sourceUrls.length > 1) {
      const newSources = [...sourceUrls];
      newSources.splice(index, 1);
      setSourceUrls(newSources);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validSources = sourceUrls.filter(url => url.trim() !== "");
    
    if (validSources.length === 0) {
      toast({
        title: "مصدر مفقود",
        description: "يجب إضافة مصدر واحد على الأقل للخبر",
        variant: "destructive"
      });
      return;
    }
    
    if (isRumorCheck && rumorClaim.trim().length === 0) {
      toast({
        title: "نص الإشاعة مفقود",
        description: "يجب كتابة نص الإشاعة التي يفنّدها هذا الخبر.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({
      data: {
        title,
        body,
        sourceUrls: validSources,
        category: category || undefined,
        mediaUrl: mediaUrl || undefined,
        isRumorCheck: isRumorCheck || undefined,
        rumorClaim: isRumorCheck ? rumorClaim : undefined,
        rumorVerdict: isRumorCheck ? rumorVerdict : undefined,
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">إرسال خبر للتحقق</h1>
        <p className="text-muted-foreground text-sm">
          تتم مراجعة جميع الأخبار آلياً ويدوياً قبل نشرها على المنصة.
        </p>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20 flex flex-col gap-2">
        <h3 className="font-semibold flex items-center gap-2 text-primary">
          <AlertCircle className="w-4 h-4" />
          شروط النشر الصارمة
        </h3>
        <ul className="text-sm space-y-1 list-disc list-inside px-4 text-muted-foreground">
          <li>لا مصدر = لا نشر (يجب إرفاق روابط للمصادر)</li>
          <li>صياغة رأي = رفض (الخبر يجب أن يكون موضوعياً)</li>
          <li>يجب أن يكون العنوان دقيقاً وغير مضلل</li>
          <li>تفنيد الإشاعات بمصادر موثّقة يحصل على تقييم ثقة أعلى</li>
        </ul>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="p-4 flex flex-col gap-3 border-dashed">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRumorCheck}
              onChange={(e) => setIsRumorCheck(e.target.checked)}
              className="mt-1 w-4 h-4 accent-rose-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldX className="w-4 h-4 text-rose-600" />
                هذا الخبر يفنّد إشاعة منتشرة
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                مثال: "إشاعة أن الحكومة الأردنية حوّلت التعليم إلى عن بُعد — والإشاعة كاذبة." سيُعامَل تفنيدك كخبر صحيح ويحصل على تقييم ثقة أعلى عند توفر مصادر رسمية.
              </p>
            </div>
          </label>
          {isRumorCheck && (
            <div className="flex flex-col gap-3 pt-2 border-t border-border">
              <div className="flex flex-col gap-2">
                <Label htmlFor="rumor-claim">نص الإشاعة المتداولة</Label>
                <Textarea
                  id="rumor-claim"
                  placeholder="اكتب نص الإشاعة كما تنتشر تماماً، حتى يفهم القارئ ما يجري تفنيده..."
                  value={rumorClaim}
                  onChange={(e) => setRumorClaim(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>حكم التحقق على الإشاعة</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "false_rumor", label: "كاذبة", color: "rose" },
                    { v: "partly_true", label: "صحيحة جزئياً", color: "amber" },
                    { v: "true_claim", label: "صحيحة فعلاً", color: "emerald" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setRumorVerdict(opt.v as typeof rumorVerdict)}
                      className={`text-sm py-2 rounded-md border transition-colors ${
                        rumorVerdict === opt.v
                          ? opt.color === "rose"
                            ? "bg-rose-600 text-white border-rose-600"
                            : opt.color === "amber"
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-emerald-600 text-white border-emerald-600"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-3">
          <Label htmlFor="title">عنوان الخبر</Label>
          <Input 
            id="title" 
            placeholder="اكتب عنواناً دقيقاً يعكس المحتوى..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={8}
            className="text-lg py-6"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="category">التصنيف</Label>
          <div className="flex flex-wrap gap-2">
            {NEWS_CATEGORIES.map((cat) => {
              const selected = category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(selected ? "" : cat.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors hover-elevate ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border"
                  }`}
                >
                  <span aria-hidden>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="body">تفاصيل الخبر</Label>
          <Textarea 
            id="body" 
            placeholder="اكتب تفاصيل الخبر بموضوعية وحياد..." 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={30}
            className="min-h-[200px] resize-y text-base leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>المصادر (إلزامي)</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddSource} className="h-8 gap-1">
              <Plus className="w-3 h-3" /> إضافة مصدر
            </Button>
          </div>
          
          <div className="flex flex-col gap-3">
            {sourceUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  type="url"
                  placeholder="https://..." 
                  value={url}
                  onChange={(e) => handleUpdateSource(index, e.target.value)}
                  required={index === 0}
                  className="flex-1 dir-ltr text-left"
                />
                {sourceUrls.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSource(index)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="media">رابط صورة (اختياري)</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="media" 
              type="url"
              placeholder="https://..." 
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="flex-1 dir-ltr text-left"
            />
            <Button type="button" variant="secondary" size="icon">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full mt-4 text-base font-semibold"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? "جاري الإرسال..." : "إرسال للتحقق"}
        </Button>
      </form>
    </div>
  );
}
