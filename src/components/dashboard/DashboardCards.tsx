import type { Trade } from "../../types/trade";

interface DashboardCardsProps {
  trades: Trade[];
}

export function DashboardCards({ trades }: DashboardCardsProps) {
  return (
    <div className="h-full">
      <div className="container mx-auto p-6">
        {/* Empty dashboard - grid removed */}
      </div>
    </div>
  );
}
