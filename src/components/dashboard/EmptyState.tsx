import { Search } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-12 bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      <div className="rounded-full bg-muted dark:bg-gray-700 p-3 mx-auto w-fit">
        <Search className="h-6 w-6 text-muted-foreground dark:text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-foreground dark:text-gray-200">
        No data available
      </h3>
      <p className="mt-1 text-sm text-muted-foreground dark:text-gray-400">
        Start by adding some data to your dashboard
      </p>
    </div>
  );
}
