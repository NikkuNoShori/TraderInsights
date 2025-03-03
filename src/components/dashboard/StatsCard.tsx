import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Tooltip";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  trend: "up" | "down";
  trendValue: string;
  isLoading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  trendValue,
  isLoading,
  className,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-4", className)}>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-7 w-32" />
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Tooltip content={description} side="top" delayDuration={0}>
            <button className="inline-flex items-center justify-center rounded-full hover:bg-muted/50 p-0.5 transition-colors">
              <HelpCircle className="h-4 w-4 text-muted-foreground/70 transition-colors" />
            </button>
          </Tooltip>
        </div>
        {trend === "up" ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </div>
      <div className="mt-2">
        <p className={cn(
          "text-2xl font-semibold",
          trend === "up" ? "text-green-600" : "text-red-600"
        )}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{trendValue}</p>
      </div>
    </Card>
  );
}
