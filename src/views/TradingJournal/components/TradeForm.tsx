import React, { useState } from 'react';
import { useSupabase } from '../../../contexts/SupabaseContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/button';
import { FormInput } from '../../../components/ui/FormInput';
import { Select } from '../../../components/ui/Select';
import { toast } from 'react-hot-toast';
import type { Trade, OptionDetails } from '../../../types/trade';

interface TradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trade?: Trade;
}

export function TradeForm({ isOpen, onClose, onSuccess, trade }: TradeFormProps) {
  const { supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Trade>>({
    symbol: trade?.symbol || '',
    type: trade?.type || 'stock',
    side: trade?.side || 'Long',
    quantity: trade?.quantity || 0,
    entry_price: trade?.entry_price || 0,
    status: trade?.status || 'open',
    option_details: trade?.option_details || null,
    notes: trade?.notes || '',
    date: trade?.date || new Date().toISOString().split('T')[0],
    time: trade?.time || new Date().toTimeString().split(' ')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      option_details: {
        ...(prev.option_details || {}),
        [name]: value
      } as OptionDetails
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tradeData = {
        ...formData,
        user_id: user?.id,
        total: (formData.quantity || 0) * (formData.entry_price || 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (trade?.id) {
        // Update existing trade
        const { error } = await supabase
          .from('trades')
          .update(tradeData)
          .eq('id', trade.id);

        if (error) throw error;
        toast.success('Trade updated successfully');
      } else {
        // Insert new trade
        const { error } = await supabase
          .from('trades')
          .insert([tradeData]);

        if (error) throw error;
        toast.success('Trade added successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving trade:', error);
      toast.error('Failed to save trade');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{trade ? 'Edit Trade' : 'Add New Trade'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              required
              placeholder="AAPL"
              className="uppercase"
            />

            <Select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="stock">Stock</option>
              <option value="option">Option</option>
            </Select>

            <Select
              label="Side"
              name="side"
              value={formData.side}
              onChange={handleInputChange}
              required
            >
              <option value="Long">Long</option>
              <option value="Short">Short</option>
            </Select>

            <FormInput
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min={0}
            />

            <FormInput
              label="Entry Price"
              name="entry_price"
              type="number"
              value={formData.entry_price}
              onChange={handleInputChange}
              required
              min={0}
              step="0.01"
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
            </Select>

            <FormInput
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />

            <FormInput
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>

          {formData.type === 'option' && (
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
              <FormInput
                label="Strike Price"
                name="strike"
                type="number"
                value={formData.option_details?.strike}
                onChange={handleOptionDetailsChange}
                required={formData.type === 'option'}
                min={0}
                step="0.01"
              />

              <FormInput
                label="Expiration"
                name="expiration"
                type="date"
                value={formData.option_details?.expiration}
                onChange={handleOptionDetailsChange}
                required={formData.type === 'option'}
              />

              <Select
                label="Contract Type"
                name="contract_type"
                value={formData.option_details?.contract_type}
                onChange={handleOptionDetailsChange}
                required={formData.type === 'option'}
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
              </Select>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <FormInput
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
              placeholder="Add any notes about this trade..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground"
            >
              {isLoading ? 'Saving...' : trade ? 'Update Trade' : 'Add Trade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 