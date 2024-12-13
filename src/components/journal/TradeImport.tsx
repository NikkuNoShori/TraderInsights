import { useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { Button } from '../ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from '../ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '../ui/select';
import Papa from 'papaparse';
import type { SchwabTradeImport } from '../../types/broker';
import type { ParseResult } from 'papaparse';

interface TradeImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TradeImport({ isOpen, onClose, onSuccess }: TradeImportProps) {
  const { supabase, user } = useSupabase();
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setFile(file);
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setLoading(true);
    try {
      const text = await file.text();
      Papa.parse<SchwabTradeImport>(text, {
        header: true,
        complete: async (results: ParseResult<SchwabTradeImport>) => {
          const trades = results.data.map((row: SchwabTradeImport) => ({
            user_id: user.id,
            broker_id: selectedBrokers[0],
            symbol: row.Symbol,
            type: 'stock',
            side: row.Action === 'Buy' ? 'Long' : 'Short',
            quantity: row.Quantity,
            price: row.Price,
            total: Math.abs(row.Amount),
            fees: row.Fees || 0,
            date: row.Date,
            status: 'closed',
            created_at: new Date().toISOString()
          }));

          const { error } = await supabase
            .from('trades')
            .insert(trades);

          if (error) throw error;
          onSuccess();
        }
      });
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-border text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Import Trades</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Select Broker</label>
            <Select
              value={selectedBrokers.join(',')}
              onValueChange={(value) => setSelectedBrokers(value.split(',').filter(Boolean))}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Choose a broker" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="schwab">Charles Schwab</SelectItem>
                <SelectItem value="td">TD Ameritrade</SelectItem>
                <SelectItem value="ibkr">Interactive Brokers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">CSV File</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label 
                htmlFor="csv-upload"
                className="cursor-pointer inline-block"
              >
                <Button 
                  variant="outline" 
                  disabled={loading}
                  className="border-border hover:bg-background"
                >
                  Choose File
                </Button>
              </label>
              {file && (
                <span className="text-sm text-text-muted">
                  {file.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border hover:bg-background"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || loading || selectedBrokers.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Importing...' : 'Import Trades'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 