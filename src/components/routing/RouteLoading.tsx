import { Loader2 } from "lucide-react";

export function RouteLoading() {
  return (
    <div className="flex-grow flex items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
