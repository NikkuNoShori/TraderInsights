import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { useTheme } from '@/providers/ThemeProvider';
import { clsx } from 'clsx';
import "react-datepicker/dist/react-datepicker.css";

type DatePickerProps = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  placeholderText?: string;
  isClearable?: boolean;
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
  dropdownMode?: string;
};

export function DatePicker({ selected, onChange, className, ...props }: DatePickerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative">
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        className={clsx(
          "input",
          className
        )}
        wrapperClassName="w-full"
        calendarClassName={clsx(
          "react-datepicker",
          isDark && "dark"
        )}
        showPopperArrow={false}
        dateFormat="yyyy-MM-dd"
        {...props}
      />
    </div>
  );
} 
