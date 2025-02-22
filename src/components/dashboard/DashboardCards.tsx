import React from 'react';
import { DashboardGrid } from './DashboardGrid';
import { StatsCard } from './StatsCard';
import type { Trade } from '../../types/trade';
import { formatCurrency } from '../../utils/formatters';
import { 
  faChartBar, 
  faChartLine, 
  faDollarSign, 
  faArrowTrendUp,
  faCog,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../ui/button';
import { useDashboard } from '../../contexts/DashboardContext';
import { useState } from 'react';
import { DashboardProfileSelect } from './DashboardProfileSelect';
import type { Layout } from 'react-grid-layout';
import { RecentTradesCard } from './RecentTradesCard';
import { PlaybookCard } from './PlaybookCard';
import { useDashboardStore } from '../../stores/dashboardStore';

interface DashboardCardsProps {
  trades: Trade[];
  layouts: Layout[];
}

export function DashboardCards({ trades, layouts }: DashboardCardsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { layouts: contextLayouts, updateLayouts: contextUpdateLayouts } = useDashboard();
  const { isEditing: storeEditing, updateLayouts: storeUpdateLayouts } = useDashboardStore();

  const completedTrades = trades.filter(trade => trade.status === 'closed');
  const winningTrades = completedTrades.filter(t => (t.pnl || 0) > 0);
  const winRate = completedTrades.length ? winningTrades.length / completedTrades.length : 0;
  const totalPnL = completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const profitFactor = (() => {
    const gains = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const losses = Math.abs(completedTrades.filter(t => (t.pnl || 0) <= 0).reduce((sum, t) => sum + (t.pnl || 0), 0));
    return losses === 0 ? gains : gains / losses;
  })();

  const handleSaveChanges = () => {
    contextUpdateLayouts(contextLayouts);
    storeUpdateLayouts(layouts);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const handleLayoutChange = (newLayouts: Layout[]) => {
    if (!isEditing) return;
    storeUpdateLayouts(newLayouts);
  };

  return (
    <div className="h-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <DashboardProfileSelect />
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => {
              if (isEditing && hasUnsavedChanges) {
                handleSaveChanges();
              } else {
                setIsEditing(!isEditing);
              }
            }}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCog} className="h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>
      <DashboardGrid trades={trades} isEditing={isEditing}>
        <div key="total-pnl" className="bg-card rounded-lg shadow-lg overflow-hidden">
          <StatsCard
            title="Total P&L"
            value={formatCurrency(totalPnL)}
            icon={faDollarSign}
            trend={totalPnL > 0 ? 'up' : 'down'}
            className="bg-gradient-to-br from-card to-card/80 border border-slate-700/50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          />
        </div>
        <div key="win-rate" className="bg-card rounded-lg shadow-lg overflow-hidden">
          <StatsCard
            title="Win Rate"
            value={`${(winRate * 100).toFixed(1)}%`}
            icon={faArrowTrendUp}
            trend={winRate >= 0.5 ? 'up' : 'down'}
            className="bg-gradient-to-br from-card to-card/80 border border-slate-700/50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          />
        </div>
        <div key="profit-factor" className="bg-card rounded-lg shadow-lg overflow-hidden">
          <StatsCard
            title="Profit Factor"
            value={profitFactor.toFixed(2)}
            icon={faChartLine}
            trend={profitFactor >= 1 ? 'up' : 'down'}
            className="bg-gradient-to-br from-card to-card/80 border border-slate-700/50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          />
        </div>
        <div key="total-trades" className="bg-card rounded-lg shadow-lg overflow-hidden">
          <StatsCard
            title="Total Trades"
            value={trades.length.toString()}
            icon={faChartBar}
            className="bg-gradient-to-br from-card to-card/80 border border-slate-700/50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          />
        </div>
      </DashboardGrid>
      <div className="grid gap-6 mt-6">
        <RecentTradesCard trades={trades} />
        <PlaybookCard />
      </div>
    </div>
  );
} 