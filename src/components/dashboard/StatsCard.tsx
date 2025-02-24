import { Card } from "../ui/card";
import { cn } from "../../lib/utils";
import { ArrowDownIcon, ArrowUpIcon, LucideIcon } from "lucide-react";
import { DASHBOARD_THEME } from "../../config/dashboardTheme";
import { useResizeDetector } from "react-resize-detector";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string | number;
  trendDirection?: "up" | "down";
  subtitle?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
  subtitle,
  className,
}: StatsCardProps) {
  const { style, cards } = DASHBOARD_THEME;
  const { ref, width, height } = useResizeDetector();

  // Calculate scale factor based on container size
  const scale = width ? Math.min(width / 300, height ? height / 200 : 1) : 1;

  return (
    <div ref={ref} className="h-full w-full">
      <Card
        className={cn(
          "relative flex flex-col h-full w-full",
          "bg-white dark:bg-gray-800",
          "transition-all overflow-hidden",
          style.border && "border border-gray-200 dark:border-gray-700",
          style.shadow,
          {
            "hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/40":
              true,
          },
          className,
        )}
        style={{
          borderRadius: style.borderRadius,
          transition: style.transition,
        }}
      >
        <div
          className="absolute inset-0 flex flex-col p-6"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transition: "transform 200ms ease",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {title}
            </h3>
            {Icon && (
              <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center min-h-0">
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
              {value}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {trend && trendDirection && (
            <div
              className={cn(
                "flex items-center mt-2 text-sm font-medium gap-1",
                trendDirection === "up"
                  ? "text-green-500 dark:text-green-400"
                  : "text-red-500 dark:text-red-400",
              )}
            >
              {trendDirection === "up" ? (
                <ArrowUpIcon className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate">{trend}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
