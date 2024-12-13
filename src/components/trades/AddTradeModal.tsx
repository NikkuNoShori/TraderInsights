import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { ManualTradeForm } from './ManualTradeForm';
import { ImportTradeForm } from './ImportTradeForm';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeAdded: () => void;
}

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  onTradeAdded,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background dark:bg-dark-paper border-border dark:border-dark-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-foreground dark:text-dark-text">
              Add Trade
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground dark:text-dark-muted dark:hover:text-dark-text"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted dark:bg-dark-muted">
            <TabsTrigger 
              value="manual"
              className="data-[state=active]:bg-background dark:data-[state=active]:bg-dark-paper data-[state=active]:text-foreground dark:data-[state=active]:text-dark-text"
            >
              Manual Entry
            </TabsTrigger>
            <TabsTrigger 
              value="import"
              className="data-[state=active]:bg-background dark:data-[state=active]:bg-dark-paper data-[state=active]:text-foreground dark:data-[state=active]:text-dark-text"
            >
              Import Trades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <ManualTradeForm onSuccess={onTradeAdded} />
          </TabsContent>

          <TabsContent value="import">
            <ImportTradeForm onSuccess={onTradeAdded} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 