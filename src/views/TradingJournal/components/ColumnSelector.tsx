import { useState } from "react";
import { Button } from "@/components/ui";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { TRADE_COLUMNS, TradeColumn } from "./TradeListColumns";

interface ColumnSelectorProps {
  visibleColumns: string[];
  onColumnToggle: (columnId: string) => void;
}

export function ColumnSelector({
  visibleColumns,
  onColumnToggle,
}: ColumnSelectorProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Settings2 className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem disabled className="font-medium">
          Toggle Columns
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {TRADE_COLUMNS.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibleColumns.includes(column.id)}
            onCheckedChange={() => onColumnToggle(column.id)}
            onSelect={(e) => e.preventDefault()}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
