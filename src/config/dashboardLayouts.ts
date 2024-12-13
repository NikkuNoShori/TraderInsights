import type { Layout } from 'react-grid-layout';
import type { DashboardCardType } from '../types/dashboard';

// Base layout properties for different card sizes
const CARD_SIZES = {
  stats: { w: 3, h: 2 },      // Stats cards (3 columns wide, 2 rows tall)
  medium: { w: 6, h: 4 },     // Half-width charts
  large: { w: 12, h: 4 }      // Full-width charts
};

export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 100,            // Taller row height for better proportions
  margin: [16, 16],          // Space between cards
  containerPadding: [16, 16] // Padding around the grid
};

// Helper to create a layout with default properties
const createLayout = (id: string, x: number, y: number, size: keyof typeof CARD_SIZES): Layout => ({
  i: id,
  x,
  y,
  ...CARD_SIZES[size],
  minW: 3,                // Minimum width of 3 columns
  minH: 2,                // Minimum height of 2 rows
  maxW: 12,               // Maximum width of full grid
  maxH: 8,                // Maximum height of 8 rows
  static: false
});

export const DEFAULT_LAYOUTS: Layout[] = [
  // Stats Row (4 cards x 3 columns each)
  createLayout('total-pnl', 0, 0, 'stats'),
  createLayout('win-rate', 3, 0, 'stats'),
  createLayout('profit-factor', 6, 0, 'stats'),
  createLayout('total-trades', 9, 0, 'stats'),
  
  // Charts Row (2 cards x 6 columns each)
  createLayout('recent-trades', 0, 2, 'medium'),
  createLayout('performance', 6, 2, 'medium')
];

// Default enabled cards in order
export const DEFAULT_ENABLED_CARDS: DashboardCardType[] = [
  'total_pnl',
  'win_rate',
  'profit_factor',
  'average_win',
  'active_trades',
  'total_trades',
  'average_loss',
  'max_drawdown_pct',
  'playbook',
  'recent_trades'
];

// Validate that all card types have a layout
export const validateLayouts = (cardTypes: DashboardCardType[]) => {
  const missingLayouts = cardTypes.filter(type => 
    !DEFAULT_LAYOUTS.find(layout => layout.i === type.replace('_', '-'))
  );
  if (missingLayouts.length > 0) {
    console.warn('Missing layouts for card types:', missingLayouts);
  }
  return missingLayouts.length === 0;
}; 