import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { useFilterStore, type FilterSection } from '@/stores/filterStore';
import { Checkbox } from '@/components/ui/checkbox';

const BROKERS = [
  { id: 'webull', name: 'Webull' },
  { id: 'schwab', name: 'Charles Schwab' },
  { id: 'td', name: 'TD Ameritrade' },
  { id: 'ibkr', name: 'Interactive Brokers' },
];

interface FilterBarProps {
  section: FilterSection;
}

export function FilterBar({ section }: FilterBarProps) {
  const { filters, toggleBroker, clearFilters, setActiveSection } = useFilterStore();
  const [isOpen, setIsOpen] = useState(false);

  // Set the active section when the component mounts or section changes
  useEffect(() => {
    setActiveSection(section);
  }, [section, setActiveSection]);

  const currentFilters = filters[section];
  
  const activeFilterCount = Object.values(currentFilters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  ).length;

  return (
    <div className="flex items-center gap-2 mb-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearFilters(section);
                    setIsOpen(false);
                  }}
                  className="h-8 px-2 text-muted-foreground"
                >
                  Clear All
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium mb-2">Brokers</h5>
              <div className="space-y-2">
                {BROKERS.map((broker) => (
                  <div key={broker.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={broker.id}
                      checked={(currentFilters.brokers || []).includes(broker.id)}
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

            {/* Placeholder for Trade Type filter */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Trade Type</h5>
              <div className="text-sm text-muted-foreground italic">Coming soon</div>
            </div>

            <Separator />

            {/* Placeholder for Side filter */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Side</h5>
              <div className="text-sm text-muted-foreground italic">Coming soon</div>
            </div>

            <Separator />

            {/* Placeholder for Status filter */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Status</h5>
              <div className="text-sm text-muted-foreground italic">Coming soon</div>
            </div>

            <Separator />

            {/* Placeholder for P&L Range filter */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">P&L Range</h5>
              <div className="text-sm text-muted-foreground italic">Coming soon</div>
            </div>

            <Separator />

            {/* Placeholder for Win/Loss filter */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Win/Loss</h5>
              <div className="text-sm text-muted-foreground italic">Coming soon</div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {currentFilters.brokers && currentFilters.brokers.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {currentFilters.brokers.map((brokerId) => {
            const broker = BROKERS.find(b => b.id === brokerId);
            return broker && (
              <span key={brokerId} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-primary/10">
                {broker.name}
                <button
                  onClick={() => toggleBroker(brokerId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
} 