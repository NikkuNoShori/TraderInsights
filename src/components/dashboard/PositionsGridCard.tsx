import { useMemo } from "@/lib/react";
import { BrokerCard } from "./BrokerCard";
import { useBrokerDataStore } from "@/stores/brokerDataStore";
import { formatCurrency } from "@/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PositionsGridCardProps {
  accountId: string;
}

export function PositionsGridCard({ accountId }: PositionsGridCardProps) {
  const { positions, error } = useBrokerDataStore();
  const accountPositions = positions[accountId] || [];

  const totalValue = useMemo(() => {
    return accountPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
  }, [accountPositions]);

  const totalPnL = useMemo(() => {
    return accountPositions.reduce((sum, pos) => sum + pos.openPnl, 0);
  }, [accountPositions]);

  return (
    <BrokerCard
      title="Positions"
      description={`${accountPositions.length} positions • Total Value: ${formatCurrency(totalValue)} • P&L: ${formatCurrency(totalPnL)}`}
      accountId={accountId}
      error={error}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Market Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">P&L %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountPositions.map((position) => (
              <TableRow key={position.id}>
                <TableCell>{position.symbol}</TableCell>
                <TableCell className="text-right">{position.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(position.price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(position.marketValue)}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    position.openPnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(position.openPnl)}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    position.openPnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {((position.openPnl / position.marketValue) * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </BrokerCard>
  );
} 