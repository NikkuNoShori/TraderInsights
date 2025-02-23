import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSupabaseClient } from '../../../hooks/useSupabaseClient';
import { FormField } from '../../../components/ui/form-field';
import { Button } from '../../../components/ui/button';
import { Trade } from '../../../types/trade';

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  entry_price: z.number().min(0, 'Entry price must be positive'),
  exit_price: z.number().min(0, 'Exit price must be positive'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['BUY', 'SELL']),
  status: z.enum(['OPEN', 'CLOSED']),
  notes: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  onTradeAdded: (trade: Trade) => void;
  onCancel: () => void;
}

export function TradeForm({ onTradeAdded, onCancel }: TradeFormProps) {
  const { supabase, user } = useSupabaseClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
  });

  const onSubmit = async (data: TradeFormData) => {
    if (!user) return;
    
    try {
      const { data: trade, error } = await supabase
        .from('trades')
        .insert([{
          ...data,
          user_id: user.id,
          pnl: (data.exit_price - data.entry_price) * data.quantity * (data.type === 'BUY' ? 1 : -1)
        }])
        .select()
        .single();

      if (error) throw error;
      onTradeAdded(trade);
    } catch (error) {
      console.error('Error adding trade:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-lg border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Symbol"
          {...register('symbol')}
          error={errors.symbol?.message}
        />
        <FormField
          label="Date"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />
        <FormField
          label="Entry Price"
          type="number"
          step="0.01"
          {...register('entry_price', { valueAsNumber: true })}
          error={errors.entry_price?.message}
        />
        <FormField
          label="Exit Price"
          type="number"
          step="0.01"
          {...register('exit_price', { valueAsNumber: true })}
          error={errors.exit_price?.message}
        />
        <FormField
          label="Quantity"
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
        />
        <FormField
          label="Type"
          type="select"
          {...register('type')}
          error={errors.type?.message}
          options={[
            { value: 'BUY', label: 'Buy' },
            { value: 'SELL', label: 'Sell' },
          ]}
        />
        <FormField
          label="Status"
          type="select"
          {...register('status')}
          error={errors.status?.message}
          options={[
            { value: 'OPEN', label: 'Open' },
            { value: 'CLOSED', label: 'Closed' },
          ]}
        />
      </div>
      <FormField
        label="Notes"
        type="textarea"
        {...register('notes')}
        error={errors.notes?.message}
      />
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Trade'}
        </Button>
      </div>
    </form>
  );
} 