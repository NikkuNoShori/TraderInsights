import { type ReactNode } from "@/lib/react";

interface DashboardGridProps {
  children: ReactNode;
  columns?: number;
}

export function DashboardGrid({ children, columns = 3 }: DashboardGridProps) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
} 