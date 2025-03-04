import { useState } from "@/lib/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import type {
  Trade,
  CreateTradeData,
  TradeType,
  TradeSide,
  TradeStatus,
} from "@/types/trade";

const optionDetailsSchema = z.object({
  strike: z.number().positive("Strike price must be positive"),
  expiration: z.string(),
  option_type: z.enum(["call", "put"]),
  contract_type: z.enum(["call", "put"]),
});

const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  type: z.enum(["stock", "option", "crypto", "forex"] as const),
  side: z.enum(["Long", "Short"] as const),
  quantity: z.number().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive"),
  entry_date: z.string(),
  entry_price: z.number().positive("Entry price must be positive"),
  exit_price: z.number().positive("Exit price must be positive").optional(),
  exit_date: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["open", "closed", "pending"] as const).default("open"),
  option_details: optionDetailsSchema.optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface ManualTradeFormProps {
  onSuccess: (trade: CreateTradeData) => void;
  initialData?: Partial<Trade>;
  onCancel: () => void;
  orderType?: "buy" | "sell";
}

export function ManualTradeForm({
  onSuccess,
  initialData,
  onCancel,
  orderType,
}: ManualTradeFormProps) {
  const [isOption, setIsOption] = useState(initialData?.type === "option");
  const { user } = useAuthStore();

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
      symbol: initialData?.symbol?.toUpperCase() || "",
      type: (initialData?.type as TradeType) || "stock",
      side: (initialData?.side as TradeSide) || "Long",
      quantity: initialData?.quantity || undefined,
      price: initialData?.price || undefined,
      entry_date:
        orderType === "sell"
          ? initialData?.exit_date
          : initialData?.entry_date || new Date().toISOString().split("T")[0],
      entry_price:
        orderType === "sell"
          ? initialData?.exit_price
          : initialData?.entry_price || undefined,
      exit_price: initialData?.exit_price,
      exit_date: initialData?.exit_date,
      notes: initialData?.notes || "",
      status: (initialData?.status as TradeStatus) || "open",
      option_details: initialData?.option_details,
    },
  });

  const onSubmit = async (data: TradeFormData) => {
    if (!user) {
      toast.error("You must be logged in to add trades");
      return;
    }

    try {
      const currentTime = new Date().toISOString();
      const [datePart, timePart] = currentTime.split("T");

      const tradeData: CreateTradeData = {
        ...data,
        direction: data.side,
        total: data.quantity * data.price,
        date:
          orderType === "sell" ? data.exit_date || datePart : data.entry_date,
        time: timePart.split(".")[0],
        timestamp: currentTime,
        entry_time:
          orderType === "sell"
            ? initialData?.entry_time || ""
            : timePart.split(".")[0],
        entry_timestamp:
          orderType === "sell"
            ? initialData?.entry_timestamp || currentTime
            : currentTime,
        status: orderType === "sell" ? "closed" : "open",
        option_details: isOption ? data.option_details : undefined,
      };

      if (orderType === "sell") {
        tradeData.exit_date = data.entry_date;
        tradeData.exit_time = timePart.split(".")[0];
        tradeData.exit_timestamp = currentTime;
        tradeData.exit_price = data.entry_price;
      }

      onSuccess(tradeData);
      reset();
    } catch (error) {
      console.error("Error submitting trade:", error);
      toast.error("Failed to submit trade");
    }
  };

  const handleTypeChange = (value: TradeType) => {
    setValue("type", value);
    setIsOption(value === "option");
    if (value !== "option") {
      setValue("option_details", undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {!orderType && (
          <>
            <div>
              <Input
                {...register("symbol")}
                placeholder="Symbol"
                className="uppercase"
                disabled={!!orderType}
              />
              {errors.symbol && (
                <span className="text-xs text-red-500">
                  {errors.symbol.message}
                </span>
              )}
            </div>

            <Select
              value={watch("type")}
              onValueChange={handleTypeChange}
              disabled={!!orderType}
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
              onValueChange={(value: TradeSide) => setValue("side", value)}
              disabled={!!orderType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Side" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Long">Long</SelectItem>
                <SelectItem value="Short">Short</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}

        <Input
          {...register("quantity", { valueAsNumber: true })}
          type="number"
          placeholder={`${orderType === "sell" ? "Exit" : "Entry"} Quantity`}
          disabled={orderType === "sell"}
        />
        {errors.quantity && (
          <span className="text-xs text-red-500">
            {errors.quantity.message}
          </span>
        )}

        <Input
          {...register(orderType === "sell" ? "exit_price" : "entry_price", {
            valueAsNumber: true,
          })}
          type="number"
          step="0.01"
          placeholder={`${orderType === "sell" ? "Exit" : "Entry"} Price`}
        />
        {errors[orderType === "sell" ? "exit_price" : "entry_price"] && (
          <span className="text-xs text-red-500">
            {
              errors[orderType === "sell" ? "exit_price" : "entry_price"]
                ?.message
            }
          </span>
        )}

        <Input
          {...register(orderType === "sell" ? "exit_date" : "entry_date")}
          type="date"
          placeholder={`${orderType === "sell" ? "Exit" : "Entry"} Date`}
        />

        {isOption && !orderType && (
          <>
            <Input
              {...register("option_details.strike", { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Strike Price"
              disabled={!!orderType}
            />
            <Input
              {...register("option_details.expiration")}
              type="date"
              placeholder="Expiration Date"
              disabled={!!orderType}
            />
            <Select
              value={watch("option_details.option_type")}
              onValueChange={(value: "call" | "put") =>
                setValue("option_details.option_type", value)
              }
              disabled={!!orderType}
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

      {!orderType && (
        <div>
          <textarea
            {...register("notes")}
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Add notes about your trade..."
          />
        </div>
      )}

      <div className="flex justify-between space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Reset Form
        </Button>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : orderType === "sell"
                ? "Update Sell Order"
                : orderType === "buy"
                  ? "Update Buy Order"
                  : initialData
                    ? "Update Trade"
                    : "Add Trade"}
          </Button>
        </div>
      </div>
    </form>
  );
}
