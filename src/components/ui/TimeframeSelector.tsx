import { Button } from "@/components/ui/button";

export type TimeframeOption = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

interface TimeframeSelectorProps {
  value: TimeframeOption;
  onChange: (value: TimeframeOption) => void;
}

const timeframeOptions: TimeframeOption[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      {timeframeOptions.map((option) => (
        <Button
          key={option}
          variant={value === option ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
