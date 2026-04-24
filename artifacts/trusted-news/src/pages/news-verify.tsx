import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetVerification, getGetVerificationQueryKey, VerificationStage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function NewsVerify({ id }: { id: string }) {
  const [, setLocation] = useLocation();
  const [shouldPoll, setShouldPoll] = useState(true);

  const { data: report } = useGetVerification(id, {
    query: {
      enabled: !!id,
      queryKey: getGetVerificationQueryKey(id),
      refetchInterval: shouldPoll ? 1500 : false,
    }
  });

  useEffect(() => {
    if (report?.progress === 100) {
      setShouldPoll(false);
      // Wait a moment then redirect to the news detail page
      const timer = setTimeout(() => {
        setLocation(`/news/${id}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [report?.progress, id, setLocation]);

  const radius = 60;
  const circumference = 2 * Math.Math.PI * radius;
  const progressPercent = report?.progress || 0;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col h-screen max-h-[800px] justify-center items-center py-10 px-4 max-w-md mx-auto">
      <div className="flex flex-col items-center gap-2 mb-12 text-center">
        <h1 className="text-2xl font-bold">جاري التحقق من الخبر</h1>
        <p className="text-muted-foreground text-sm">
          نظام الذكاء الاصطناعي يقوم الآن بفحص المصادر ومطابقة المعلومات لضمان الدقة
        </p>
      </div>

      <div className="relative flex items-center justify-center mb-12">
        {/* SVG Circle Progress */}
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            className="text-muted/30"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="96"
            cy="96"
          />
          <motion.circle
            className="text-primary transition-all duration-500 ease-out"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="96"
            cy="96"
          />
        </svg>
        
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{Math.round(progressPercent)}%</span>
          {report?.etaSeconds ? (
            <span className="text-xs text-muted-foreground mt-1">متبقي {report.etaSeconds} ثانية</span>
          ) : null}
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        {report?.stages?.map((stage: VerificationStage, index: number) => (
          <div key={stage.key} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="shrink-0">
              {stage.status === 'passed' ? (
                <CheckCircle2 className="w-6 h-6 text-trust-green" />
              ) : stage.status === 'failed' ? (
                <XCircle className="w-6 h-6 text-trust-red" />
              ) : stage.status === 'running' ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted" />
              )}
            </div>
            
            <div className="flex flex-col flex-1">
              <span className={cn(
                "font-bold text-sm",
                stage.status === 'pending' ? "text-muted-foreground" : "text-foreground"
              )}>
                {stage.label}
              </span>
              {stage.detail && (
                <span className="text-xs text-muted-foreground mt-0.5">{stage.detail}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8 w-full">
        {progressPercent === 100 && (
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={() => setLocation(`/news/${id}`)}
          >
            عرض النتيجة النهائية <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}
