import { useMemo } from "react";
import { BrokerCard } from "./BrokerCard";
import { useBrokerDataStore } from "@/stores/brokerDataStore";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PositionDistributionCardProps {
  accountId: string;
}

export function PositionDistributionCard({ accountId }: PositionDistributionCardProps) {
  const { positions, error } = useBrokerDataStore();
  const accountPositions = positions[accountId] || [];

  // Calculate position distribution by sector
  const sectorDistribution = useMemo(() => {
    if (accountPositions.length === 0) return [];

    // Group positions by sector
    const sectorMap = new Map<string, number>();
    
    accountPositions.forEach(position => {
      const sector = position.sector || "Unknown";
      const currentValue = sectorMap.get(sector) || 0;
      sectorMap.set(sector, currentValue + position.marketValue);
    });

    // Convert to array format for chart
    const totalValue = Array.from(sectorMap.values()).reduce((sum, value) => sum + value, 0);
    
    return Array.from(sectorMap.entries()).map(([sector, value]) => ({
      name: sector,
      value,
      percentage: (value / totalValue) * 100
    }));
  }, [accountPositions]);

  // Calculate position distribution by type (stock, etf, etc.)
  const typeDistribution = useMemo(() => {
    if (accountPositions.length === 0) return [];

    // Group positions by type
    const typeMap = new Map<string, number>();
    
    accountPositions.forEach(position => {
      const type = position.type || "Unknown";
      const currentValue = typeMap.get(type) || 0;
      typeMap.set(type, currentValue + position.marketValue);
    });

    // Convert to array format for chart
    const totalValue = Array.from(typeMap.values()).reduce((sum, value) => sum + value, 0);
    
    return Array.from(typeMap.entries()).map(([type, value]) => ({
      name: type,
      value,
      percentage: (value / totalValue) * 100
    }));
  }, [accountPositions]);

  // Colors for the pie charts
  const COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#6366f1", // indigo
    "#14b8a6", // teal
  ];

  return (
    <BrokerCard
      title="Position Distribution"
      description="Distribution of positions by sector and type"
      accountId={accountId}
      error={error}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-2">By Sector</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}
                >
                  {sectorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(label) => `Sector: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">By Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(label) => `Type: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </BrokerCard>
  );
} 