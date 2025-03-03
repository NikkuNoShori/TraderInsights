import { useDashboardStore, type CardType } from "@/stores/dashboardStore";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardConfigProps {
  section: "dashboard" | "journal";
}

const CARD_LABELS: Record<CardType, string> = {
  total_pnl: "Total P&L",
  win_rate: "Win Rate",
  profit_factor: "Profit Factor",
  average_win: "Average Win",
  average_loss: "Average Loss",
  total_trades: "Total Trades",
  max_drawdown_pct: "Max Drawdown",
  recent_trades: "Recent Trades",
  playbook: "Playbook",
  active_trades: "Active Trades",
};

export function DashboardConfig({ section }: DashboardConfigProps) {
  const { enabledCards, toggleCard } = useDashboardStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Open dashboard settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Dashboard Layout</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(CARD_LABELS).map(([id, label]) => (
          <DropdownMenuCheckboxItem
            key={id}
            checked={enabledCards[section].includes(id as CardType)}
            onCheckedChange={() => toggleCard(section, id as CardType)}
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
