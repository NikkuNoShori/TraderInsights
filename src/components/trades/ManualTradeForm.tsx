import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

const stockTradeSchema = z.object({
  type: z.enum(['stock', 'option']),
  symbol: z.string().min(1, 'Symbol is required'),
  entry_date: z.string(),
  exit_date: z.string().optional(),
  entry_price: z.number().positive(),
  exit_price: z.number().positive().optional(),
  quantity: z.number().positive(),
  direction: z.enum(['long', 'short']),
  portfolio_id: z.string().uuid(),
  notes: z.string().optional(),
});

const optionTradeSchema = stockTradeSchema.extend({
  strike_price: z.number().positive(),
  expiration_date: z.string(),
  option_type: z.enum(['call', 'put']),
  contract_size: z.number().default(100),
});

type StockTrade = z.infer<typeof stockTradeSchema>;
type OptionTrade = z.infer<typeof optionTradeSchema>;

interface ManualTradeFormProps {
  onSuccess: () => void;
}

export const ManualTradeForm: React.FC<ManualTradeFormProps> = ({ onSuccess }) => {
  const [isOption, setIsOption] = React.useState(false);
  const { user } = useAuthStore();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<StockTrade | OptionTrade>({
    resolver: zodResolver(isOption ? optionTradeSchema : stockTradeSchema),
  });

  const onSubmit = async (data: StockTrade | OptionTrade) => {
    try {
      const { error } = await supabase
        .from('trades')
        .insert([data]);

      if (error) throw error;
      
      toast.success('Trade added successfully');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding trade:', error);
      toast.error('Failed to add trade');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-light-text dark:text-dark-text">
            Trade Type
          </h3>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Select between stock or options trade
          </p>
        </div>
        <Switch
          checked={isOption}
          onCheckedChange={setIsOption}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            {...register('symbol')}
            placeholder="Symbol"
            className="uppercase"
          />
          {errors.symbol && (
            <p className="text-sm text-red-500 mt-1">{errors.symbol.message}</p>
          )}
        </div>

        <Select
          {...register('direction')}
          defaultValue="long"
        >
          <option value="long">Long</option>
          <option value="short">Short</option>
        </Select>

        {/* Common fields */}
        <Input
          {...register('entry_price', { valueAsNumber: true })}
          type="number"
          step="0.01"
          placeholder="Entry Price"
        />
        <Input
          {...register('quantity', { valueAsNumber: true })}
          type="number"
          placeholder="Quantity"
        />
        <Input
          {...register('entry_date')}
          type="datetime-local"
        />
        <Input
          {...register('exit_date')}
          type="datetime-local"
        />

        {/* Option-specific fields */}
        {isOption && (
          <>
            <Input
              {...register('strike_price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Strike Price"
            />
            <Input
              {...register('expiration_date')}
              type="date"
              placeholder="Expiration Date"
            />
            <Select
              {...register('option_type')}
              defaultValue="call"
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </Select>
          </>
        )}
      </div>

      <div className="mt-4">
        <textarea
          {...register('notes')}
          className="w-full h-24 p-2 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
          placeholder="Add notes about your trade..."
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button type="submit" isLoading={isSubmitting}>
          Add Trade
        </Button>
      </div>
    </form>
  );
}; 