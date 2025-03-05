import * as React from "react";
import { clsx } from "clsx";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  autoCompleteType?: string;
}

export function FormInput({
  label,
  error,
  helperText,
  className,
  autoCompleteType = "off",
  type,
  ...props
}: FormInputProps) {
  const getAutoComplete = () => {
    if (autoCompleteType !== "off") return autoCompleteType;

    switch (type) {
      case "email":
        return "email";
      case "password":
        return "current-password";
      case "tel":
        return "tel";
      case "url":
        return "url";
      case "search":
        return "search";
      default:
        return "off";
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium mb-2 text-default">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div>
        <input
          autoComplete={getAutoComplete()}
          type={type}
          className={clsx(
            "block w-full rounded-lg text-sm transition-colors duration-200",
            "min-h-[42px] px-4 py-2.5",
            "bg-card",
            "text-default",
            "border border-border",
            "placeholder:text-muted",

            // Hover state
            "hover:border-primary/50",

            // Focus state
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",

            // Disabled state
            props.disabled && ["opacity-60 cursor-not-allowed"],

            // Error state
            error && [
              "border-error",
              "focus:ring-error/20",
              "focus:border-error",
            ],

            className,
          )}
          {...props}
        />
      </div>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <div
          className={clsx(
            "mt-2 text-xs",
            error ? "text-error" : "text-muted",
          )}
        >
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
