import { useState } from "@/lib/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import type { Trade, CreateTradeData } from "@/types/trade";

const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  type: z.enum(["stock", "option", "crypto", "forex"]),
  side: z.enum(["Long", "Short"]),
  quantity: z.number().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive"),
  entry_date: z.string(),
  entry_price: z.number().positive("Entry price must be positive"),
  exit_price: z.number().positive("Exit price must be positive").optional(),
  exit_date: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["open", "closed", "pending"]).default("open"),
  option_details: z.object({
    strike: z.number().positive("Strike price must be positive"),
    expiration: z.string(),
    option_type: z.enum(["call", "put"]),
    contract_type: z.enum(["call", "put"]),
  }).optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface ManualTradeFormProps {
  onSuccess: (trade: CreateTradeData) => void;
  initialData?: Partial<Trade>;
}

export function ManualTradeForm({ onSuccess, initialData }: ManualTradeFormProps) {
  const [isOption, setIsOption] = useState(initialData?.type === "option");
  const { user } = useAuthStore();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: initialData?.symbol || "",
      type: initialData?.type || "stock",
      side: initialData?.side || "Long",
      quantity: initialData?.quantity || undefined,
      price: initialData?.price || undefined,
      entry_date: initialData?.entry_date || new Date().toISOString().split("T")[0],
      entry_price: initialData?.entry_price || undefined,
      exit_price: initialData?.exit_price,
      exit_date: initialData?.exit_date,
      notes: initialData?.notes || "",
      status: initialData?.status || "open",
      ...(initialData?.type === "option" && {
        option_details: initialData.option_details,
      }),
    },
  });

  const onSubmit = async (data: TradeFormData) => {
    if (!user) {
      toast.error("You must be logged in to add trades");
      return;
    }

    try {
      const tradeData: CreateTradeData = {
        direction: data.side,
        total: data.quantity * data.price,
        date: data.entry_date,
        time: new Date().toISOString().split('T')[1],
        ...data,
        status: data.status || 'open',
        option_details: data.type === 'option' && data.option_details ? {
          strike: data.option_details.strike,
          expiration: data.option_details.expiration,
          option_type: data.option_details.option_type,
          contract_type: data.option_details.contract_type
        } : undefined
      };

      onSuccess(tradeData);
      reset();
    } catch (error) {
      console.error("Error submitting trade:", error);
      toast.error("Failed to submit trade");
    }
  };

  const handleTypeChange = (value: string) => {
    setValue("type", value as "stock" | "option" | "crypto" | "forex");
    setIsOption(value === "option");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            {...register("symbol")}
            placeholder="Symbol"
            className="uppercase"
          />
          {errors.symbol && (
            <span className="text-xs text-red-500">{errors.symbol.message}</span>
          )}
        </div>

        <Select
          value={watch("type")}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="option">Option</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="forex">Forex</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={watch("side")}
          onValueChange={(value) => setValue("side", value as "Long" | "Short")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Side" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Long">Long</SelectItem>
            <SelectItem value="Short">Short</SelectItem>
          </SelectContent>
        </Select>

        <Input
          {...register("quantity", { valueAsNumber: true })}
          type="number"
          placeholder="Quantity"
        />
        {errors.quantity && (
          <span className="text-xs text-red-500">{errors.quantity.message}</span>
        )}

        <Input
          {...register("price", { valueAsNumber: true })}
          type="number"
          step="0.01"
          placeholder="Price"
        />
        {errors.price && (
          <span className="text-xs text-red-500">{errors.price.message}</span>
        )}

        <Input
          {...register("entry_date")}
          type="date"
          placeholder="Entry Date"
        />

        {isOption && (
          <>
            <Input
              {...register("option_details.strike", { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Strike Price"
            />
            <Input
              {...register("option_details.expiration")}
              type="date"
              placeholder="Expiration Date"
            />
            <Select
              value={watch("option_details.option_type")}
              onValueChange={(value) => setValue("option_details.option_type", value as "call" | "put")}
            >
              <SelectTrigger>
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

      <div>
        <textarea
          {...register("notes")}
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Add notes about your trade..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : initialData ? "Update Trade" : "Add Trade"}
        </Button>
      </div>
    </form>
  );
}
