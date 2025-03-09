import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";
import { useFilterStore } from "@/stores/filterStore";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeframeSelector } from "@/components/ui/timeframeSelector";

const BROKERS = [
  { id: "webull", name: "Webull" },
  { id: "schwab", name: "Charles Schwab" },
  { id: "td", name: "TD Ameritrade" },
  { id: "ibkr", name: "Interactive Brokers" },
];

export function FilterBar() {
  const { filters, toggleBroker, clearFilters, setTimeframe } = useFilterStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter((value) =>
    Array.isArray(value) ? value.length > 0 : value !== undefined,
  ).length;

  return (
    <div className="flex items-center gap-2">
      <TimeframeSelector
        value={filters.timeframe || "1M"}
        onValueChange={setTimeframe}
        className="w-[120px]"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-10 border-border/40 hover:bg-accent hover:border-border/60 transition-colors"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground"
                  onClick={() => clearFilters()}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <h5 className="text-sm font-medium mb-2">Brokers</h5>
              <div className="grid grid-cols-2 gap-2">
                {BROKERS.map((broker) => (
                  <div key={broker.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={broker.id}
                      checked={filters.brokers?.includes(broker.id)}
                      onCheckedChange={() => toggleBroker(broker.id)}
                    />
                    <label
                      htmlFor={broker.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {broker.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Trade Type</h5>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Side</h5>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Status</h5>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h5 className="text-sm font-medium">P&L Range</h5>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Win/Loss</h5>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
