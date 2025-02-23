import { Filter, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
}

interface TableColumnsManagerProps {
  columns: TableColumn[];
  onChange: (columns: TableColumn[]) => void;
}

export function TableColumnsManager({ columns, onChange }: TableColumnsManagerProps) {
  const toggleColumn = (columnId: string) => {
    onChange(
      columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  return (
    <div className="relative group">
      <button
        className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700"
        aria-label="Manage columns"
      >
        <Filter className="h-5 w-5" />
      </button>

      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Show/Hide Columns</h3>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {columns.map(column => (
            <button
              key={column.id}
              onClick={() => toggleColumn(column.id)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 text-sm"
            >
              <span className="text-gray-700">{column.label}</span>
              <span className={clsx(
                'flex items-center justify-center w-5 h-5 rounded-md transition-colors',
                column.visible ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
              )}>
                <Check className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}