import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
    <DropdownMenu>
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
          <DropdownMenuItem
            key={column.id}
            onClick={() => onColumnToggle(column.id)}
            className="flex items-center gap-2"
          >
            <input
              type="checkbox"
              checked={visibleColumns.includes(column.id)}
              onChange={() => {}}
              className="h-4 w-4"
            />
            {column.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
