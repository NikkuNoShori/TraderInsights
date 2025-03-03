import { BarChart3, LineChart, CandlestickChart } from "lucide-react";
import { clsx } from "clsx";

export type ChartType = "area" | "bar" | "candlestick";

interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onChange: (type: ChartType) => void;
}

export function ChartTypeSelector({
  selectedType,
  onChange,
}: ChartTypeSelectorProps) {
  const chartTypes: Array<{
    type: ChartType;
    icon: typeof BarChart3;
    label: string;
  }> = [
    { type: "area", icon: LineChart, label: "Area" },
    { type: "bar", icon: BarChart3, label: "Bar" },
    { type: "candlestick", icon: CandlestickChart, label: "Candlestick" },
  ];

  return (
    <div className="flex space-x-2">
      {chartTypes.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={clsx(
            "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
            selectedType === type
              ? "bg-indigo-100 text-indigo-700"
              : "bg-white text-gray-600 hover:bg-gray-50",
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
