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
  Legend,
} from "recharts";

interface CashVsInvestedCardProps {
  accountId: string;
}

export function CashVsInvestedCard({ accountId }: CashVsInvestedCardProps) {
  const { positions, balances, error } = useBrokerDataStore();
  const accountPositions = positions[accountId] || [];
  const accountBalances = balances[accountId] || [];

  // Calculate cash and invested amounts
  const cashVsInvestedData = useMemo(() => {
    if (accountBalances.length === 0) return [];

    // Calculate total cash
    const totalCash = accountBalances.reduce((sum, balance) => sum + balance.cash, 0);
    
    // Calculate total invested (market value of positions)
    const totalInvested = accountPositions.reduce((sum, position) => sum + position.marketValue, 0);
    
    // Calculate total portfolio value
    const totalPortfolioValue = totalCash + totalInvested;
    
    // Calculate percentages
    const cashPercentage = totalPortfolioValue > 0 ? (totalCash / totalPortfolioValue) * 100 : 0;
    const investedPercentage = totalPortfolioValue > 0 ? (totalInvested / totalPortfolioValue) * 100 : 0;
    
    return [
      {
        name: "Cash",
        value: totalCash,
        percentage: cashPercentage,
        color: "#3b82f6", // blue
      },
      {
        name: "Invested",
        value: totalInvested,
        percentage: investedPercentage,
        color: "#10b981", // green
      },
    ];
  }, [accountBalances, accountPositions]);

  // Calculate total portfolio value
  const totalPortfolioValue = useMemo(() => {
    return cashVsInvestedData.reduce((sum, item) => sum + item.value, 0);
  }, [cashVsInvestedData]);

  // Calculate cash percentage
  const cashPercentage = useMemo(() => {
    if (totalPortfolioValue === 0) return 0;
    return (cashVsInvestedData[0]?.value || 0) / totalPortfolioValue * 100;
  }, [cashVsInvestedData, totalPortfolioValue]);

  return (
    <BrokerCard
      title="Cash vs Invested"
      description={`Total Portfolio: ${formatCurrency(totalPortfolioValue)} • Cash: ${formatPercentage(cashPercentage)} • Invested: ${formatPercentage(100 - cashPercentage)}`}
      accountId={accountId}
      error={error}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={cashVsInvestedData}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
            <YAxis type="category" dataKey="name" />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar
              dataKey="value"
              name="Amount"
              fill={(data) => data.color}
              label={{ position: "right", formatter: (value) => formatCurrency(value as number) }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </BrokerCard>
  );
} 