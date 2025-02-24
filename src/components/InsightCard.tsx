import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { clsx } from "clsx";

interface InsightCardProps {
  type: "positive" | "negative" | "warning" | "info";
  title: string;
  description: string;
}

export function InsightCard({ type, title, description }: InsightCardProps) {
  const icons = {
    positive: TrendingUp,
    negative: TrendingDown,
    warning: AlertTriangle,
    info: CheckCircle,
  };

  const Icon = icons[type];

  const styles = {
    positive: "bg-green-50 border-green-200 text-green-700",
    negative: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div className={clsx("p-4 rounded-lg border", styles[type])}>
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 mt-0.5" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}
