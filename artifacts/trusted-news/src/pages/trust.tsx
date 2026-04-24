import { useListTrustTiers, getListTrustTiersQueryKey, TrustTier } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ShieldCheck, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function Trust() {
  const [, setLocation] = useLocation();
  const { data: tiers, isLoading } = useListTrustTiers({
    query: { queryKey: getListTrustTiersQueryKey() }
  });

  return (
    <div className="flex flex-col gap-6 py-4 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/me")} className="rounded-full">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">مستويات الثقة</h1>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm leading-relaxed text-muted-foreground flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p>
          نظام الثقة يعتمد على دقة الأخبار التي تنشرها. كلما كانت مصادرك أقوى ومعلوماتك أصح، زاد مستوى موثوقيتك وحصلت على امتيازات أكثر.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {tiers?.map((tier: TrustTier, index: number) => (
            <div key={tier.name} className="relative pt-6">
              {/* Connection line between tiers */}
              {index !== tiers.length - 1 && (
                <div className="absolute top-16 bottom-0 right-8 w-0.5 bg-border -z-10" />
              )}
              
              <div className="flex gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-sm border-4 border-background z-10"
                  style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                >
                  <ShieldCheck className="w-8 h-8" />
                </div>
                
                <div className="flex flex-col gap-4 flex-1 pt-2">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold" style={{ color: tier.color }}>{tier.label}</h2>
                    {tier.description && <p className="text-sm text-muted-foreground">{tier.description}</p>}
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">متطلبات المستوى</h3>
                    <div className="flex flex-col gap-3">
                      {tier.requirements.map((req, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {req.met ? <Check className="w-4 h-4 text-trust-green" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground" />}
                              {req.text}
                            </span>
                            {req.progress !== undefined && <span className="font-medium">{req.progress}%</span>}
                          </div>
                          {req.progress !== undefined && (
                            <Progress value={req.progress} className="h-1.5" />
                          )}
                        </div>
                      ))}
                    </div>

                    {tier.perks && tier.perks.length > 0 && (
                      <>
                        <div className="h-px bg-border my-1" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">الامتيازات</h3>
                        <ul className="text-sm space-y-2">
                          {tier.perks.map((perk, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
