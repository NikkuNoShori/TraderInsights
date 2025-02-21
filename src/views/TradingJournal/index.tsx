import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  faChartBar,
  faChartLine,
  faDollarSign,
  faArrowTrendUp
} from '@fortawesome/free-solid-svg-icons';
import { useSupabase } from '../../contexts/SupabaseContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { TradeList } from './components/TradeList';
import { TradeForm } from './components/TradeForm';
import { useTradeMetrics } from './hooks/useTradeMetrics';
import { useTrades } from './hooks/useTrades';
import { formatCurrency } from '../../utils/formatters';
import type { Trade } from '../../types/trade';

export default function TradingJournal() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { supabase, user } = useSupabase();
  const queryClient = useQueryClient();

  // Use custom hooks for data fetching and metrics
  const { data: tradeData, isLoading, error } = useTrades(currentPage);
  const trades = tradeData?.trades || [];
  const totalPages = tradeData?.totalPages || 1;
  const metrics = useTradeMetrics(trades);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      toast.success('Trade deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['trades', user?.id] });
    } catch (err) {
      console.error('Error deleting trade:', err);
      toast.error('Failed to delete trade');
    }
  }, [queryClient, user?.id, supabase]);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ['trades', user?.id] });
    toast.success('Trade added successfully');
  }, [queryClient, user?.id]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex-grow bg-background p-6">
        <div className="flex justify-center">
          <Spinner className="text-primary" size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow bg-background p-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Trades</h3>
          <p className="text-text-muted">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex-grow bg-background p-6 space-y-6">
        <PageHeader 
          title="Trading Journal"
          subtitle="Track and analyze your trades"
          actions={
            <Button
              onClick={() => setIsFormOpen(true)}
              size="lg"
              className="bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20"
            >
              Add Trade
            </Button>
          }
        />

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Trades"
            value={trades.length.toString()}
            icon={faChartBar}
            className="bg-gradient-to-br from-card to-card/80 border border-slate-700/50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          />
          <StatsCard
            title="Win Rate"
            value={`${(metrics.winRate * 100).toFixed(1)}%`}
            icon={faArrowTrendUp}
            trend={metrics.winRate >= 0.5 ? 'up' : 'down'}
            className="bg-gradient-to-br from-card to-card/80 border border-slate-700/50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          />
          <StatsCard
            title="Total P&L"
            value={formatCurrency(metrics.totalPnL)}
            icon={faDollarSign}
            trend={metrics.totalPnL > 0 ? 'up' : 'down'}
            className="bg-gradient-to-br from-card to-card/80 border border-slate-700/50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          />
          <StatsCard
            title="Profit Factor"
            value={metrics.profitFactor.toFixed(2)}
            icon={faChartLine}
            trend={metrics.profitFactor >= 1 ? 'up' : 'down'}
            className="bg-gradient-to-br from-card to-card/80 border border-slate-700/50 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:border-slate-600/50 transition-all duration-300"
          />
        </div>
        
        {/* Trade List */}
        <div className="bg-gradient-to-br from-card to-card/90 rounded-xl shadow-xl shadow-slate-900/20 border border-slate-700/50 overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-slate-700/50 bg-card/50">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Trade History</h2>
              <p className="text-sm text-text-muted mt-1">Manage and track your trading activity</p>
            </div>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20"
            >
              Add Trade
            </Button>
          </div>
          <TradeList 
            trades={trades}
            onDelete={handleDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <TradeForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      </div>
    </ErrorBoundary>
  );
} 