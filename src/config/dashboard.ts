export const DEFAULT_ENABLED_CARDS = [
  'total_pnl',
  'win_rate',
  'profit_factor',
  'average_win',
  'active_trades',
  'total_trades'
] as const;

export type DashboardCardType = typeof DEFAULT_ENABLED_CARDS[number]; 