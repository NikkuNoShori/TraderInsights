import type { DashboardCardType } from "@/types/dashboard";
import { Button } from "@/components/ui";

interface DashboardConfigProps {
  enabledCards: DashboardCardType[];
  onChange: (cards: DashboardCardType[]) => void;
  onClose: () => void;
}

interface CardOption {
  type: DashboardCardType;
  label: string;
}

const AVAILABLE_CARDS: readonly CardOption[] = [
  { type: "total_pnl", label: "Total P&L" },
  { type: "win_rate", label: "Win Rate" },
  { type: "profit_factor", label: "Profit Factor" },
  { type: "average_win", label: "Average Win" },
  { type: "active_trades", label: "Active Trades" },
  { type: "total_trades", label: "Total Trades" },
] as const;

export function DashboardConfig({
  enabledCards,
  onChange,
  onClose,
}: DashboardConfigProps) {
  return (
    <div className="fixed inset-0 bg-background/50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg w-full max-w-2xl border border-border">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">
          Configure Dashboard
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-text-secondary">
              Enabled Cards
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_CARDS.map((card) => (
                <label key={card.type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enabledCards.includes(card.type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...enabledCards, card.type]);
                      } else {
                        onChange(enabledCards.filter((c) => c !== card.type));
                      }
                    }}
                  />
                  <span className="text-text-muted">{card.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
