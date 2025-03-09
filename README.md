# TraderInsights

A comprehensive trading analytics platform for traders to track performance, analyze market data, and improve trading strategies.

## Features

### Dashboard
- **Customizable Dashboard**: Drag-and-drop interface to personalize your trading workspace
- **Performance Metrics**: Track key trading metrics including P&L, win rate, and trade distribution
- **Market Overview**: Real-time market data visualization with TradingView integration
- **Technical Analysis**: Advanced charting with indicators and drawing tools
- **Watchlists**: Track your favorite stocks and market movers

### Trade Management
- **Trade Journal**: Log and track all your trades with detailed analytics
- **Performance Analysis**: Visualize your trading performance over time
- **Trade Statistics**: Analyze your trading patterns and identify strengths/weaknesses
- **Import/Export**: Support for importing trades from various brokers

### Market Data
- **Real-time Data**: Live market data through Polygon.io integration
- **Historical Data**: Access to historical price data for analysis
- **Technical Indicators**: Over 100+ technical indicators through TradingView
- **Market Hours Indicator**: Track market open/close status

### User Experience
- **Dark/Light Mode**: Theme support for comfortable viewing in any environment
- **Responsive Design**: Works on desktop and tablet devices
- **Error Handling**: Robust error boundaries and fallbacks
- **WebSocket Status**: Monitor real-time data connection status

## Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Routing**: React Router
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **UI Components**: 
  - Radix UI for accessible components
  - Tailwind CSS for styling
  - Tremor for data visualization components
  - Lucide React for icons
- **Data Visualization**:
  - Recharts for performance data
  - TradingView for market data
- **Data Handling**:
  - TanStack Query for data fetching
  - Date-fns for date manipulation
  - Papa Parse for CSV parsing
  - XLSX for Excel file handling
- **Layout**: React Grid Layout for dashboard customization

### Backend
- **Server**: Express.js with TypeScript
- **Security**:
  - Helmet for HTTP security
  - CORS for cross-origin resource sharing
  - Rate limiting for API protection
- **Authentication**: Supabase for user authentication and management
- **Data Storage**: Supabase for database storage

### Integrations
- **Market Data**: Polygon.io for real-time and historical market data
- **Alternative Data**: Alpha Vantage for additional financial data
- **Broker Integration**: WebUll API for trade data import

## Unified Chart System

The application uses a dual charting approach:

1. **Recharts for P&L and Performance Data**: Custom visualization of trading performance metrics
2. **TradingView for Market Data**: Professional-grade financial charts with advanced features

All charts use a unified configuration system defined in `src/config/chartConfig.ts` that ensures:
- Consistent sizing and styling
- Theme-aware configurations (light/dark mode)
- Standardized color schemes
- Shared configuration across different chart types

## Environment Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env.local`
4. Update the environment variables with your API keys

### Required Environment Variables

- `VITE_POLYGON_API_KEY`: Your Polygon.io API key for market data
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- Other environment variables as listed in `.env.example`

## Development

Run the frontend development server:
```
npm run dev
```

Run the backend server:
```
npm run server
```

Run both concurrently:
```
npm run dev:all
```

## Building for Production

```
npm run build
```

## API Integrations

### Polygon.io Integration

The application uses Polygon.io for real-time market data. The integration includes:

- REST API for historical data and company information
- WebSocket connection for real-time trade data
- Rate limiting (5 requests per minute)

#### Known Issues

- The Polygon.io WebSocket client types are currently supplemented with custom type definitions
- WebSocket reconnection logic needs to be implemented
- Rate limiting needs to be reviewed for production use

### Alpha Vantage Integration

Used for additional financial data including:
- Company fundamentals
- Economic indicators
- Alternative data sets

### WebUll Integration

Integration with WebUll for:
- Importing trade history
- Analyzing trade performance
- Syncing portfolio data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 