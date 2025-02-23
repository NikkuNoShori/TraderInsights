import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/utils/cn';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
  isClearable?: boolean;
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
  dropdownMode?: 'scroll' | 'select';
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = 'Select date...',
  isClearable = true,
  showMonthDropdown = true,
  showYearDropdown = true,
  dropdownMode = 'select',
  dateFormat = 'MM/dd/yyyy',
  minDate,
  maxDate,
}: DatePickerProps) {
  return (
    <div className={cn('relative', className)}>
      <ReactDatePicker
        selected={value}
        onChange={onChange}
        placeholderText={placeholder}
        isClearable={isClearable}
        showMonthDropdown={showMonthDropdown}
        showYearDropdown={showYearDropdown}
        dropdownMode={dropdownMode}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
} 
