import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Trade } from '../../types/trade';

interface TradeRowProps {
  trade: Trade;
  onDelete?: (id: string) => void;
}

export function TradeRow({ trade, onDelete }: TradeRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div 
        className="flex items-center justify-between p-3 bg-card dark:bg-dark-paper rounded-lg hover:bg-muted/50 dark:hover:bg-dark-muted/20 cursor-pointer"
        onClick={() => navigate(`/app/journal/trades/${trade.id}`)}
      >
        {/* Expand/Collapse */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1 hover:bg-muted dark:hover:bg-dark-muted rounded"
        >
          {isExpanded ? 
            <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
        </button>

        {/* Symbol and Type */}
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs rounded ${
            trade.direction === 'long' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {trade.direction === 'long' ? 'Long' : 'Short'}
          </span>
          <span className="font-medium">{trade.symbol}</span>
        </div>

        {/* Trade Details */}
        <div className="flex items-center space-x-8">
          <div className="text-sm">
            <span className="text-muted-foreground">Qty:</span> {trade.quantity}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Entry:</span> {formatCurrency(trade.entry_price)}
          </div>
          {trade.exit_price && (
            <div className="text-sm">
              <span className="text-muted-foreground">Exit:</span> {formatCurrency(trade.exit_price)}
            </div>
          )}
          {trade.pnl !== null && (
            <div className={`text-sm font-medium ${
              trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {formatCurrency(trade.pnl)}
            </div>
          )}
        </div>

        {/* Date and Actions */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {formatDate(new Date(trade.entry_date))}
          </span>
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(trade.id);
              }}
              className="text-muted-foreground hover:text-rose-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-4 bg-muted/50 dark:bg-dark-muted/20 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Strategy</div>
              <div className="mt-1 text-sm">{trade.strategy || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Risk/Reward</div>
              <div className="mt-1 text-sm">{trade.risk_reward || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Notes</div>
              <div className="mt-1 text-sm">{trade.notes || 'No notes'}</div>
            </div>
            {trade.tags && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Tags</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {trade.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded bg-muted dark:bg-dark-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 