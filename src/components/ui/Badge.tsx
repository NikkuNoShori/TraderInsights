import { cn } from "@/lib/utils";
import { Tooltip } from "./Tooltip";

interface BadgeProps {
  type?: "success" | "error" | "warning" | "info" | "default" | "soon" | "beta" | "new";
  children: React.ReactNode;
  tooltipContent?: string;
  className?: string;
}

export function Badge({ type = "default", children, tooltipContent, className }: BadgeProps) {
  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        type === "success" && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        type === "error" && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        type === "warning" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        type === "info" && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        type === "default" && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        type === "soon" && "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
        type === "beta" && "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
        type === "new" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
        className
      )}
    >
      {children}
    </span>
  );

  if (tooltipContent) {
    return (
      <Tooltip content={tooltipContent}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
}
