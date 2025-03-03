import type { Trade } from "@/types/trade";
import { formatCurrency } from "@/lib/utils/formatters";

interface PlaybookCardProps {
  trades: Trade[];
}

export function PlaybookCard({ trades }: PlaybookCardProps) {
  const playbooks = trades.reduce((acc, trade) => {
    if (!trade.playbook) return acc;
    
    if (!acc[trade.playbook]) {
      acc[trade.playbook] = {
        name: trade.playbook,
        totalTrades: 0,
        winningTrades: 0,
        totalPnl: 0,
      };
    }
    
    acc[trade.playbook].totalTrades++;
    if ((trade.pnl || 0) > 0) {
      acc[trade.playbook].winningTrades++;
    }
    acc[trade.playbook].totalPnl += trade.pnl || 0;
    
    return acc;
  }, {} as Record<string, { name: string; totalTrades: number; winningTrades: number; totalPnl: number; }>);

  const playbookStats = Object.values(playbooks).sort((a, b) => b.totalPnl - a.totalPnl);

  return (
    <div className="bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border">
      <h3 className="text-lg font-medium mb-3">Playbook Performance</h3>
      <div className="space-y-4">
        {playbookStats.length === 0 ? (
          <p className="text-muted-foreground">No playbook data available</p>
        ) : (
          <div className="space-y-3">
            {playbookStats.map((playbook) => (
              <div key={playbook.name} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{playbook.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Win Rate: {((playbook.winningTrades / playbook.totalTrades) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className={playbook.totalPnl >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatCurrency(playbook.totalPnl)}
                  </p>
                  <p className="text-sm text-muted-foreground">{playbook.totalTrades} trades</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
