import type { DashboardCard, DashboardCardType, DashboardConfig } from '../types/dashboard';
import { PlaybookCard } from '../components/dashboard/PlaybookCard';
import { RecentTradesCard } from '../components/dashboard/RecentTradesCard';
import type { Layout } from 'react-grid-layout';
import { DEFAULT_LAYOUTS, DEFAULT_ENABLED_CARDS } from './dashboardLayouts';

interface DashboardCardConfig extends DashboardCard {
  component?: React.ComponentType<any>;
  defaultSize?: {
    w: number;
    h: number;
  };
}

export const DASHBOARD_CARDS: Record<DashboardCardType, DashboardCardConfig> = {
  total_pnl: {
    type: 'total_pnl',
    label: 'Total P&L',
    description: 'Total profit/loss across all trades'
  },
  win_rate: {
    type: 'win_rate',
    label: 'Win Rate',
    description: 'Percentage of winning trades'
  },
  profit_factor: {
    type: 'profit_factor',
    label: 'Profit Factor',
    description: 'Ratio of gross profit to gross loss'
  },
  total_trades: {
    type: 'total_trades',
    label: 'Total Trades',
    description: 'Total number of completed trades'
  },
  active_trades: {
    type: 'active_trades',
    label: 'Active Trades',
    description: 'Currently open positions'
  },
  average_win: {
    type: 'average_win',
    label: 'Average Win',
    description: 'Average profit per winning trade'
  },
  average_loss: {
    type: 'average_loss',
    label: 'Average Loss',
    description: 'Average loss per losing trade'
  },
  recent_trades: {
    type: 'recent_trades',
    label: 'Recent Trades',
    description: 'List of most recent trades',
    component: RecentTradesCard,
    defaultSize: { w: 3, h: 2 }
  },
  playbook: {
    type: 'playbook',
    label: 'Playbook',
    description: 'Trading strategy performance',
    component: PlaybookCard,
    defaultSize: { w: 6, h: 2 }
  }
};

export function getDefaultDashboardConfig(): DashboardConfig {
  const defaultLayouts = DEFAULT_ENABLED_CARDS
    .map(cardType => DEFAULT_LAYOUTS[cardType])
    .filter((layout): layout is Layout => layout !== null);

  const now = new Date().toISOString();

  return {
    currentLayout: 'default',
    layouts: [{
      id: 'default',
      name: 'Default Dashboard',
      isDefault: true,
      layouts: defaultLayouts,
      enabledCards: DEFAULT_ENABLED_CARDS,
      createdAt: now,
      updatedAt: now
    }],
    enabledCards: DEFAULT_ENABLED_CARDS
  };
} 