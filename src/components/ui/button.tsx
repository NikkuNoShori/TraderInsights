import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  isLoading?: boolean
}

// Base button styles that should be used across the app
const buttonVariants = {
  default: `
    bg-primary hover:bg-primary/90 
    text-primary-foreground
    dark:bg-primary dark:text-primary-foreground
    dark:hover:bg-primary/80
  `,
  outline: `
    border border-border bg-background
    text-foreground dark:text-dark-text
    hover:bg-muted dark:hover:bg-dark-muted
    dark:border-dark-border
  `,
  secondary: `
    bg-secondary text-secondary-foreground
    dark:bg-secondary/80 dark:text-secondary-foreground
    hover:bg-secondary/80 dark:hover:bg-secondary/60
  `,
  ghost: `
    hover:bg-muted dark:hover:bg-dark-muted
    text-foreground dark:text-dark-text
  `,
  destructive: `
    bg-destructive text-destructive-foreground
    hover:bg-destructive/90 dark:hover:bg-destructive/80
    dark:text-destructive-foreground
  `,
  link: `
    text-primary dark:text-primary-400
    underline-offset-4 hover:underline
  `
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3 text-sm",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10"
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
})
Button.displayName = "Button"

export { Button }