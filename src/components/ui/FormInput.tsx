import * as React from "react"
import { clsx } from "clsx"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
}

export function FormInput({ label, error, helperText, className, ...props }: FormInputProps) {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <input
          className={clsx(
            "block w-full rounded-lg text-sm transition-all duration-200",
            "min-h-[42px] px-3.5 py-2",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-gray-100",
            "border border-gray-300 dark:border-gray-600",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            
            // Hover state
            "hover:border-gray-400 dark:hover:border-gray-500",
            
            // Focus state
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400",
            
            // Disabled state
            props.disabled && [
              "opacity-60 cursor-not-allowed",
              "bg-gray-50 dark:bg-gray-800/50",
              "border-gray-200 dark:border-gray-700"
            ],
            
            // Error state
            error && [
              "border-red-500 dark:border-red-400",
              "focus:ring-red-500/20 dark:focus:ring-red-400/20",
              "focus:border-red-500 dark:focus:border-red-400"
            ],
            
            className
          )}
          {...props}
        />
        
        {/* Focus ring effect */}
        <div 
          className={clsx(
            "absolute inset-0 rounded-lg pointer-events-none",
            "transition-opacity duration-200",
            "opacity-0 peer-focus:opacity-100",
            error 
              ? "ring-1 ring-red-500/20 dark:ring-red-400/20" 
              : "ring-1 ring-blue-500/20 dark:ring-blue-400/20"
          )} 
        />
      </div>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <div className={clsx(
          "mt-2 text-xs flex items-center space-x-1",
          error 
            ? "text-red-600 dark:text-red-400" 
            : "text-gray-500 dark:text-gray-400"
        )}>
          {error && (
            <svg 
              className="w-3.5 h-3.5 inline mr-1" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
          <span>{error || helperText}</span>
        </div>
      )}
    </div>
  );
}
