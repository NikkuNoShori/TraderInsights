import React from 'react';
import { Input, InputProps } from './input';
import { Select, SelectTrigger, SelectContent, SelectItem } from './select';
import { cn } from '../../lib/utils';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  type?: string;
  options?: { value: string; label: string }[];
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  type = 'text',
  options,
  className,
  ...props
}) => {
  const inputClasses = cn(
    className,
    error && 'border-red-500 focus:ring-red-500'
  );

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {type === 'select' && options ? (
        <Select {...props}>
          <SelectTrigger className={inputClasses}>
            <span>{options.find(opt => opt.value === props.value)?.label || 'Select...'}</span>
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input type={type} className={inputClasses} {...props} />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 