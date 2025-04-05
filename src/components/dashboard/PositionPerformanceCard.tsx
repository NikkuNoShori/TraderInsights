import { useMemo } from "react";
import { BrokerCard } from "./BrokerCard";
import { useBrokerDataStore } from "@/stores/brokerDataStore";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PositionPerformanceCardProps {
  accountId: string;
}

export function PositionPerformanceCard({ accountId }: PositionPerformanceCardProps) {
  const { positions, error } = useBrokerDataStore();
  const accountPositions = positions[accountId] || [];

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (accountPositions.length === 0) return [];

    // Sort positions by P&L percentage
    const sortedPositions = [...accountPositions].sort((a, b) => {
      const aPnlPct = (a.openPnl / a.marketValue) * 100;
      const bPnlPct = (b.openPnl / b.marketValue) * 100;
      return bPnlPct - aPnlPct;
    });

    // Take top 5 positions
    return sortedPositions.slice(0, 5).map(position => ({
      symbol: position.symbol,
      pnl: position.openPnl,
      pnlPercentage: (position.openPnl / position.marketValue) * 100,
      marketValue: position.marketValue,
    }));
  }, [accountPositions]);

  // Calculate total unrealized P&L
  const totalUnrealizedPnL = useMemo(() => {
    return accountPositions.reduce((sum, pos) => sum + pos.openPnl, 0);
  }, [accountPositions]);

  // Calculate average P&L percentage
  const averagePnLPercentage = useMemo(() => {
    if (accountPositions.length === 0) return 0;
    
    const totalPnLPercentage = accountPositions.reduce((sum, pos) => {
      return sum + ((pos.openPnl / pos.marketValue) * 100);
    }, 0);
    
    return totalPnLPercentage / accountPositions.length;
  }, [accountPositions]);

  // Calculate win rate
  const winRate = useMemo(() => {
    if (accountPositions.length === 0) return 0;
    
    const winningPositions = accountPositions.filter(pos => pos.openPnl > 0);
    return (winningPositions.length / accountPositions.length) * 100;
  }, [accountPositions]);

  return (
    <BrokerCard
      title="Position Performance"
      description={`Total P&L: ${formatCurrency(totalUnrealizedPnL)} • Avg P&L: ${formatPercentage(averagePnLPercentage)} • Win Rate: ${formatPercentage(winRate)}`}
      accountId={accountId}
      error={error}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={performanceMetrics}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="symbol" />
            <YAxis tickFormatter={(value) => formatPercentage(value)} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "pnl") return formatCurrency(value as number);
                if (name === "pnlPercentage") return formatPercentage(value as number);
                return value;
              }}
              labelFormatter={(label) => `Symbol: ${label}`}
            />
            <Bar
              dataKey="pnlPercentage"
              name="P&L %"
              fill={(data) => (data.pnl >= 0 ? "#10b981" : "#ef4444")}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </BrokerCard>
  );
} 