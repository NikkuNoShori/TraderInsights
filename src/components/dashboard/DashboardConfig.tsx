import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDashboardStore, CARD_CONFIGS, type CardType } from "@/stores/dashboardStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DashboardConfigProps {
  section: "dashboard" | "journal";
}

export function DashboardConfig({ section }: DashboardConfigProps) {
  const { enabledCards, toggleCard, resetCards } = useDashboardStore();

  const availableCards = Object.values(CARD_CONFIGS).filter(
    (card) => card.section === section
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span>Configure Cards</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Dashboard Cards</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <div className="space-y-4">
              {availableCards.map((card) => (
                <div key={card.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={card.id}
                    checked={enabledCards[section].includes(card.id)}
                    onCheckedChange={() => toggleCard(section, card.id as CardType)}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor={card.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {card.title}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => resetCards(section)}
              >
                Reset to Default
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
