import { type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/Skeleton";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down";
  subtitle?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
  subtitle,
  isLoading,
  className,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-4", className)}>
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="mt-1.5 flex items-baseline">
        <div className="truncate">
          <div className="text-xl font-semibold">{value}</div>
          {trend && (
            <div
              className={cn(
                "inline-flex items-center text-xs font-medium",
                trendDirection === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trendDirection === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
              )}
            >
              {trend}
            </div>
          )}
        </div>
      </div>

      {subtitle && (
        <div className="mt-1.5 text-xs text-muted-foreground">{subtitle}</div>
      )}
    </Card>
  );
}
