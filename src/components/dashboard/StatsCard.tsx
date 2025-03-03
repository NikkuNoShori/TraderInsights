import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  trend: "up" | "down";
  trendValue: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  trendValue,
  isLoading = false,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-[150px] mt-2" />
        <Skeleton className="h-4 w-[200px] mt-2" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {trend && (
        <div className="flex items-center gap-2 mt-4">
          {trend === "up" ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          )}
          <p className="text-sm font-medium">{trendValue}</p>
        </div>
      )}
    </div>
  );
}
