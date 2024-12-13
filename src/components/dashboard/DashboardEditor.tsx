import React from 'react';
import { Plus, Save } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DASHBOARD_CARDS } from '../../config/dashboardCards';
import { useDashboard } from '../../contexts/DashboardContext';
import type { DashboardCardType } from '../../types/dashboard';
import { toast } from '../ui/use-toast';

interface DashboardEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardEditor({ isOpen, onClose }: DashboardEditorProps) {
  const { config, createDashboard, switchDashboard, updateDashboard } = useDashboard();
  const [selectedDashboard, setSelectedDashboard] = React.useState(config.currentLayout);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState('');
  const [selectedCards, setSelectedCards] = React.useState<Set<DashboardCardType>>(
    new Set(config.enabledCards)
  );

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      const currentDashboard = config.layouts.find(l => l.id === config.currentLayout);
      setSelectedDashboard(config.currentLayout);
      setDashboardName(currentDashboard?.name || '');
      setSelectedCards(new Set(config.enabledCards));
      setIsCreatingNew(false);
    }
  }, [isOpen, config]);

  const handleToggleCard = (cardType: DashboardCardType) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardType)) {
      newSelected.delete(cardType);
    } else {
      newSelected.add(cardType);
    }
    setSelectedCards(newSelected);
  };

  const handleDashboardChange = (dashboardId: string) => {
    if (dashboardId === 'new') {
      setIsCreatingNew(true);
      setDashboardName('');
      setSelectedCards(new Set(config.enabledCards));
    } else {
      setIsCreatingNew(false);
      const dashboard = config.layouts.find(l => l.id === dashboardId);
      if (dashboard) {
        setSelectedDashboard(dashboardId);
        setDashboardName(dashboard.name);
        setSelectedCards(new Set(dashboard.enabledCards));
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!dashboardName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a dashboard name",
          variant: "destructive",
        });
        return;
      }

      if (selectedCards.size === 0) {
        toast({
          title: "Error",
          description: "Please select at least one card",
          variant: "destructive",
        });
        return;
      }

      if (isCreatingNew) {
        await createDashboard({
          name: dashboardName.trim(),
          enabledCards: Array.from(selectedCards),
        });
        toast({
          title: "Success",
          description: "Dashboard created successfully",
        });
      } else {
        await updateDashboard(selectedDashboard, {
          name: dashboardName.trim(),
          enabledCards: Array.from(selectedCards),
        });
        toast({
          title: "Success",
          description: "Dashboard updated successfully",
        });
      }

      // Switch to the dashboard if it's not currently selected
      if (selectedDashboard !== config.currentLayout) {
        switchDashboard(selectedDashboard);
      }

      onClose();
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save dashboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Dashboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Dashboard</Label>
            <Select
              value={isCreatingNew ? 'new' : selectedDashboard}
              onValueChange={handleDashboardChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a dashboard" />
              </SelectTrigger>
              <SelectContent>
                {config.layouts.map((layout) => (
                  <SelectItem key={layout.id} value={layout.id}>
                    {layout.name} {layout.isDefault && '(Default)'}
                  </SelectItem>
                ))}
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Dashboard
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Dashboard Name</Label>
            <Input
              id="name"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Enter dashboard name"
            />
          </div>

          <div className="space-y-2">
            <Label>Available Widgets</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(DASHBOARD_CARDS).map(([type, card]) => (
                <Card 
                  key={type}
                  className={`cursor-pointer transition-colors ${
                    selectedCards.has(type as DashboardCardType)
                      ? 'border-primary'
                      : 'hover:border-muted-foreground'
                  }`}
                  onClick={() => handleToggleCard(type as DashboardCardType)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">
                      {card.label}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!dashboardName.trim() || selectedCards.size === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreatingNew ? 'Create Dashboard' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 