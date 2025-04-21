import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary",
        outline: "bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2",
        lg: "h-10 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof toggleVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed, onPressedChange, ...props }, ref) => (
    <TogglePrimitive.Root
      ref={ref}
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
)

Toggle.displayName = "Toggle"

export { Toggle, toggleVariants } 