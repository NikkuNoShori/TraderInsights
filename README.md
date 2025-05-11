# TraderInsights

A modern web application for managing and analyzing your trading activities across multiple brokers.

## Features

- Import trades from multiple brokers using SnapTrade integration
- Track and analyze your trading performance
- Real-time market data (coming soon)
- Paper trading capabilities (coming soon)

## Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Supabase Edge Functions
- Authentication: Supabase Auth
- Database: Local Storage (Supabase PostgreSQL coming soon)
- API Integration: SnapTrade

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- Docker Desktop (required for Edge Functions development)
- Supabase account
- SnapTrade API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/TraderInsights.git
   cd TraderInsights
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your credentials:
   ```env
   # Required environment variables for both client and server
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_ENV=development
   VITE_SNAPTRADE_CLIENT_ID=your_snaptrade_client_id
   VITE_SNAPTRADE_CONSUMER_KEY=your_snaptrade_consumer_key
   VITE_SNAPTRADE_REDIRECT_URI=http://localhost:5173/broker-callback
   
   # Server configuration
   PORT=3000
   NODE_ENV=development
   APP_URL=http://localhost:5173
   API_RATE_LIMIT=100
   ```

4. Start the development server:
   ```bash
   npm run dev:all
   ```

### Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development instructions and current progress.

## Development Setup

### Starting the Development Environment

To properly start the development environment with working API endpoints:

1. Start the API server first:
```bash
# In one terminal
npm run server
```

2. Then start the frontend development server:
```bash
# In another terminal
npm run dev
```

This ensures that both the API server on port 3000 and the frontend on port 5173 are running, allowing proper communication between them.

### Common Issues

- **API errors (500)**: Make sure the API server is running on port 3000
- **SnapTrade integration errors**: Verify that all required environment variables are set in your `.env` file:
  - `SNAPTRADE_CLIENT_ID`
  - `SNAPTRADE_CONSUMER_KEY`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [SnapTrade](https://snaptrade.com/) for broker integration capabilities
- [Supabase](https://supabase.com/) for backend infrastructure 