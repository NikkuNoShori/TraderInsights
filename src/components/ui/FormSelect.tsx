import { forwardRef } from "react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/utils/cn";

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
  (
    {
      className,
      label,
      error,
      helperText,
      children,
      placeholder,
      value,
      onValueChange,
    },
    ref,
  ) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            ref={ref}
            className={cn(
              "w-full",
              error && "border-red-500 focus:ring-red-500",
              "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
              className,
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
        {(error || helperText) && (
          <p
            className={cn(
              "text-sm",
              error
                ? "text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400",
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";
