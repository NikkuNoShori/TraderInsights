import { type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Tooltip";

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
      <Card className={cn("p-6", className)}>
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-2 flex items-baseline">
        <div className="truncate">
          <div className="text-2xl font-semibold">{value}</div>
          {trend && (
            <div
              className={cn(
                "inline-flex items-center text-sm font-medium",
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
        <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>
      )}
    </Card>
  );
}
