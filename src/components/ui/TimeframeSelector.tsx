import React from 'react';
import { Select } from './select';
import type { SelectProps } from './select';

export type TimeframeOption = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | 'ALL';

interface TimeframeSelectorProps extends Omit<SelectProps, 'value' | 'onValueChange'> {
  value: TimeframeOption;
  onChange: (value: TimeframeOption) => void;
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

export function TimeframeSelector({ value, onChange, className, ...props }: TimeframeSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(val: string) => onChange(val as TimeframeOption)}
      className={className}
      {...props}
    >
      {OPTIONS.map(option => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
} 