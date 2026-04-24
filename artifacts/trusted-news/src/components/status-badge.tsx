import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NewsStatus } from "@workspace/api-client-react";

export function StatusBadge({ status, className }: { status: NewsStatus; className?: string }) {
  switch (status) {
    case NewsStatus.verified:
      return <Badge variant="outline" className={cn("bg-trust-green/10 text-trust-green border-trust-green/20", className)}>مؤكد</Badge>;
    case NewsStatus.unverified:
      return <Badge variant="outline" className={cn("bg-trust-amber/10 text-trust-amber border-trust-amber/20", className)}>غير مؤكد</Badge>;
    case NewsStatus.verifying:
      return <Badge variant="outline" className={cn("bg-trust-blue/10 text-trust-blue border-trust-blue/20 animate-pulse", className)}>قيد التحقق</Badge>;
    case NewsStatus.rejected:
      return <Badge variant="outline" className={cn("bg-trust-red/10 text-trust-red border-trust-red/20", className)}>مرفوض</Badge>;
    default:
      return null;
  }
}
