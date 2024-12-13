export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  portfolio_id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  shares: number;
  date: string;
  fees?: number;
  notes?: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  averageHoldingPeriod: number;
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
}

export interface TradeMetrics {
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  shares: number;
  gainLoss: number;
  gainLossPercent: number;
  holdingPeriod: number;
  fees: number;
  netReturn: number;
  riskRewardRatio: number;
} 