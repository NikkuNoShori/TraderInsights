import { clsx } from "clsx";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  className,
  size = "md",
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div
      className={clsx(
        "animate-spin rounded-full",
        "border-primary dark:border-primary-400",
        "border-b-transparent dark:border-b-transparent",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
