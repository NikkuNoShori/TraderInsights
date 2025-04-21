import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
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
  `,
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3 text-sm",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          props.children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
