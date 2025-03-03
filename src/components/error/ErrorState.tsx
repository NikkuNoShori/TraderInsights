import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function ErrorState({
  onRetry,
  message = "Failed to load content",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
      <p className="text-gray-900 font-medium mb-2">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </button>
    </div>
  );
}
