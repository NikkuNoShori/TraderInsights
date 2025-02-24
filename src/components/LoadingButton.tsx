import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

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
      className={cn("relative", className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="absolute left-1/2 -translate-x-1/2 h-5 w-5 animate-spin" />
      )}
      <span className={cn(isLoading && "invisible")}>
        {isLoading && loadingText ? loadingText : children}
      </span>
    </Button>
  );
}
