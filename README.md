# TraderInsights

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Update the environment variables with your API keys

### Required Environment Variables

- `VITE_POLYGON_API_KEY`: Your Polygon.io API key for market data
- Other environment variables as listed in `.env.example`

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

#### TODO

- [ ] Implement WebSocket reconnection logic
- [ ] Add proper error handling for WebSocket events
- [ ] Review and adjust rate limiting for production
- [ ] Monitor WebSocket connection status
- [ ] Add retry logic for failed connections 