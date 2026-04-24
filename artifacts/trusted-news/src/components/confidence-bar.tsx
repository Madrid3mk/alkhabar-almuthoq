import { cn } from "@/lib/utils";
import { Confidence } from "@workspace/api-client-react";
import { formatArabicNumber } from "@/lib/format";

interface ConfidenceBarProps {
  confidence: Confidence;
  score: number;
  className?: string;
  showLabel?: boolean;
}

export function ConfidenceBar({ confidence, score, className, showLabel = true }: ConfidenceBarProps) {
  let colorClass = "";
  let label = "";

  switch (confidence) {
    case Confidence.high:
      colorClass = "bg-trust-green";
      label = "موثوقية عالية";
      break;
    case Confidence.medium:
      colorClass = "bg-trust-amber";
      label = "موثوقية متوسطة";
      break;
    case Confidence.low:
      colorClass = "bg-trust-red";
      label = "موثوقية منخفضة";
      break;
  }

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">{label}</span>
          <span>{formatArabicNumber(score)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorClass)} 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
