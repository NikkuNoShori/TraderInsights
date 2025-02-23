import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/utils/cn';

export type TimeframeOption = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | 'ALL';

interface TimeframeSelectorProps {
  value: TimeframeOption;
  onValueChange: (value: TimeframeOption) => void;
  className?: string;
}

const OPTIONS: { value: TimeframeOption; label: string }[] = [
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: 'YTD', label: 'Year to Date' },
  { value: '1Y', label: '1 Year' },
  { value: 'ALL', label: 'All Time' }
];

export function TimeframeSelector({ value, onValueChange, className }: TimeframeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('w-[180px]', className)}>
        <SelectValue placeholder="Select timeframe" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 