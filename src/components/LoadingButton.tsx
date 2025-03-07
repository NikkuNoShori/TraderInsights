import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  isLoading,
  loadingText,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn("relative flex items-center justify-center", className)}
      disabled={isLoading || disabled}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          isLoading ? "opacity-100" : "opacity-0"
        )}
      >
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
      <span
        className={cn(
          "transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      >
        {isLoading && loadingText ? loadingText : children}
      </span>
    </Button>
  );
}
