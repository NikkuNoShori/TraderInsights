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
import { TimeframeSelector } from "@/components/ui/TimeframeSelector";

export function FilterBar() {
  const { filters, clearFilters, setTimeframe } = useFilterStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = Object.entries(filters)
    .filter(([key, value]) => {
      // Exclude timeframe from the count
      if (key === 'timeframe') return false;
      
      // Count arrays only if they have elements
      if (Array.isArray(value)) return value.length > 0;
      
      // Count other defined values
      return value !== undefined;
    })
    .length;

  return (
    <div className="flex items-center gap-2">
      <TimeframeSelector
        value={filters.timeframe || "ALL"}
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
