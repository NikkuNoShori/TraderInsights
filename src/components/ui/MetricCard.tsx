import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow",
        "border border-gray-200 dark:border-gray-700",
        "hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/40",
        "transition-all p-6",
        className,
      )}
    >
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}
