import { X, GripVertical } from "lucide-react";
import { clsx } from "clsx";
import type { WatchlistColumn } from "@/types/watchlist";

interface ColumnManagerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: WatchlistColumn[];
  onChange: (columns: WatchlistColumn[]) => void;
}

export function ColumnManager({
  isOpen,
  onClose,
  columns,
  onChange,
}: ColumnManagerProps) {
  const toggleColumn = (columnId: string) => {
    onChange(
      columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    onChange(newColumns);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative bg-white rounded-lg max-w-lg w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Manage Columns
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {columns.map((column, index) => (
                <div
                  key={column.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <button className="cursor-move">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </button>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => toggleColumn(column.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {column.label}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
