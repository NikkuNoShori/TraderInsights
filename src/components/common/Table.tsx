import { type ReactNode } from "@/lib/react";

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-dark-paper rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-dark-paper/50 rounded mb-2"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
        <thead className="bg-gray-50 dark:bg-dark-paper">
          <tr>
            {columns.map((column, i) => (
              <th
                key={i}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-paper divide-y divide-gray-200 dark:divide-dark-border">
          {data.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-dark-border/50"
            >
              {columns.map((column, i) => {
                const value = item[column.accessor];
                return (
                  <td
                    key={i}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text"
                  >
                    {column.render ? column.render(value, item) : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
