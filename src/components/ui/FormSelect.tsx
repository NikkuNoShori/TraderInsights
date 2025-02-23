import { forwardRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { cn } from '@/utils/cn';

interface FormSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  placeholder?: string;
  children?: React.ReactNode;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ className, label, error, helperText, children, placeholder, value, onValueChange, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger ref={ref} className={cn('w-full', error && 'border-red-500 focus:ring-red-500', className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
        {(error || helperText) && (
          <p className={cn('text-sm', error ? 'text-red-500' : 'text-gray-500')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
