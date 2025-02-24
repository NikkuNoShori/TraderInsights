import { useState } from '@/lib/react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { useToast } from "../../hooks/useToast";
import { useAuthStore } from "../../stores/authStore";
import { supabase } from "../../lib/supabase";

const stockTradeSchema = z.object({
  type: z.enum(["stock", "option"]),
  symbol: z.string().min(1, "Symbol is required"),
  entry_date: z.string(),
  exit_date: z.string().optional(),
  entry_price: z.number().positive(),
  exit_price: z.number().positive().optional(),
  quantity: z.number().positive(),
  direction: z.enum(["long", "short"]),
  portfolio_id: z.string().uuid(),
  notes: z.string().optional(),
});

const optionTradeSchema = stockTradeSchema.extend({
  strike_price: z.number().positive(),
  expiration_date: z.string(),
  option_type: z.enum(["call", "put"]),
  contract_size: z.number().default(100),
});

type StockTrade = z.infer<typeof stockTradeSchema>;
type OptionTrade = z.infer<typeof optionTradeSchema>;

interface ManualTradeFormProps {
  onSuccess: () => void;
}

export const ManualTradeForm = ({ onSuccess }: ManualTradeFormProps) => {
  const [isOption, setIsOption] = useState(false);
  const { user } = useAuthStore();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<StockTrade | OptionTrade>({
    resolver: zodResolver(isOption ? optionTradeSchema : stockTradeSchema),
    defaultValues: {
      direction: "long",
      type: "stock",
    },
  });

  const onSubmit = async (data: StockTrade | OptionTrade) => {
    try {
      const { error } = await supabase.from("trades").insert([{
        ...data,
        entry_date: data.entry_date || new Date().toISOString(),
        total: data.quantity * data.entry_price,
      }]);

      if (error) throw error;

      toast.success("Trade added successfully");
      reset();
      onSuccess();
    } catch (error) {
      console.error("Error adding trade:", error);
      toast.error("Failed to add trade");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-2 bg-card p-4 rounded-lg border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-light-text dark:text-dark-text">
            Trade Type
          </h3>
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Select between stock or options trade
          </p>
        </div>
        <Switch checked={isOption} onCheckedChange={setIsOption} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Input
            {...register("symbol")}
            placeholder="Symbol"
            className="uppercase h-8"
          />
          {errors.symbol && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.symbol.message}
            </p>
          )}
        </div>

        <Select onValueChange={(value) => setValue("direction", value as "long" | "short")} defaultValue="long">
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>

        {/* Common fields */}
        <Input
          {...register("entry_price", { valueAsNumber: true })}
          type="number"
          step="0.01"
          placeholder="Entry Price"
          className="h-8"
        />
        <Input
          {...register("quantity", { valueAsNumber: true })}
          type="number"
          placeholder="Quantity"
          className="h-8"
        />
        <Input
          {...register("entry_date")}
          type="datetime-local"
          className="h-8"
        />
        <Input
          {...register("exit_date")}
          type="datetime-local"
          className="h-8"
        />

        {/* Option-specific fields */}
        {isOption && (
          <>
            <Input
              {...register("strike_price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Strike Price"
              className="h-8"
            />
            <Input
              {...register("expiration_date")}
              type="date"
              placeholder="Expiration Date"
              className="h-8"
            />
            <Select onValueChange={(value) => setValue("option_type", value as "call" | "put")} defaultValue="call">
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Option Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="put">Put</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      <div className="mt-2">
        <textarea
          {...register("notes")}
          className="w-full h-16 p-2 text-sm rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
          placeholder="Add notes about your trade..."
        />
      </div>

      <div className="flex justify-end mt-3 space-x-2">
        <Button
          variant="outline"
          type="button"
          size="sm"
          onClick={() => reset()}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Add Trade
        </Button>
      </div>
    </form>
  );
};
