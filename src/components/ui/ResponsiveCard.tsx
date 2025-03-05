import { type ReactNode } from "@/lib/react";
import clsx from "clsx";

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  return (
    <div
      className={clsx(
        "bg-card border border-border rounded-lg p-4",
        "hover:bg-card-hover transition-colors duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}
