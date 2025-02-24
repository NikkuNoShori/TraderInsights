import { clsx } from "clsx";
import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={clsx(
        "text-sm font-medium text-gray-700 dark:text-gray-300",
        className
      )}
    >
      {children}
    </label>
  );
} 