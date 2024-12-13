import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-light-border dark:border-dark-border px-3 py-1",
          "bg-white dark:bg-dark-bg text-light-text dark:text-dark-text",
          "focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary",
          "placeholder:text-light-muted dark:placeholder:text-dark-muted",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          "hover:border-light-primary dark:hover:border-dark-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 