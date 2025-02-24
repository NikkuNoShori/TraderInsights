import { useRouteError, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export function RouteErrorBoundary() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <div className="flex-grow p-6">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Navigation Error</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error.statusText || error.message}
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
