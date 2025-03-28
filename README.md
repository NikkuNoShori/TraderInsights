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
   # See DEVELOPMENT.md for full environment variable list
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SNAPTRADE_CLIENT_ID=your_client_id
   VITE_SNAPTRADE_CONSUMER_SECRET=your_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development instructions and current progress.

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