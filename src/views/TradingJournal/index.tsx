import { useState, useEffect } from '@/lib/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { TradeList } from './components/TradeList';
import { TradeForm } from './components/TradeForm';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { useSupabaseClient } from '../../hooks/useSupabaseClient';
import { Trade } from '../../types/trade';
import { config } from '../../config';

// Mock trades for development mode
const MOCK_TRADES: Trade[] = [
  {
    id: 'dev-trade-1',
    user_id: 'dev-123',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toISOString().split('T')[1].split('.')[0],
    symbol: 'AAPL',
    type: 'stock',
    side: 'Long',
    quantity: 100,
    price: 150.00,
    total: 15000.00,
    entry_price: 150.00,
    exit_price: 155.00,
    pnl: 500.00,
    status: 'closed',
    notes: 'Mock trade for development',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'dev-trade-2',
    user_id: 'dev-123',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: new Date(Date.now() - 86400000).toISOString().split('T')[1].split('.')[0],
    symbol: 'TSLA',
    type: 'stock',
    side: 'Long',
    quantity: 50,
    price: 200.00,
    total: 10000.00,
    entry_price: 200.00,
    exit_price: 210.00,
    pnl: 500.00,
    status: 'closed',
    notes: 'Another mock trade',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const TRADES_PER_PAGE = 10;

export default function TradingJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { supabase, user } = useSupabaseClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const fetchTrades = async () => {
      try {
        // Return mock data in development mode
        if (!config.isProduction && user.id === 'dev-123') {
          setTrades(MOCK_TRADES);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setTrades(data || []);
      } catch (error) {
        console.error('Error fetching trades:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch trades');
        toast.error('Failed to load trades');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [user, supabase, navigate]);

  const handleTradeAdded = (newTrade: Trade) => {
    setTrades(prev => [newTrade, ...prev]);
    setIsAddingTrade(false);
    toast.success('Trade added successfully');
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      if (!config.isProduction && user?.id === 'dev-123') {
        setTrades(prev => prev.filter(trade => trade.id !== id));
        toast.success('Trade deleted successfully');
        return;
      }

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrades(prev => prev.filter(trade => trade.id !== id));
      toast.success('Trade deleted successfully');
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast.error('Failed to delete trade');
    }
  };

  const totalPages = Math.ceil(trades.length / TRADES_PER_PAGE);
  const paginatedTrades = trades.slice(
    (currentPage - 1) * TRADES_PER_PAGE,
    currentPage * TRADES_PER_PAGE
  );

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          <h3 className="text-lg font-medium">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trading Journal</h1>
        <Button
          onClick={() => setIsAddingTrade(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>
      </div>

      {isAddingTrade && (
        <div className="mb-8">
          <TradeForm onTradeAdded={handleTradeAdded} onCancel={() => setIsAddingTrade(false)} />
        </div>
      )}

      <TradeList 
        trades={paginatedTrades}
        isLoading={isLoading}
        onDelete={handleDeleteTrade}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 