import React from 'react';
import { GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import type { WatchlistColumn } from '../../types/watchlist';

interface DraggableHeaderProps {
  column: WatchlistColumn;
  index: number;
}

export function DraggableHeader({ column, index }: DraggableHeaderProps) {
  return (
    <th
      className={clsx(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        "group cursor-move select-none"
      )}
    >
      <div className="flex items-center space-x-2">
        <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span>{column.label}</span>
      </div>
    </th>
  );
}