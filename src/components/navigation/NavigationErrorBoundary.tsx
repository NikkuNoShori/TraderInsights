import { AlertCircle } from "lucide-react";
import { type ReactNode, type ErrorInfo } from "@/lib/react";
import { Component } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

interface NavigationError extends Error {
  code?: string;
  info?: ErrorInfo;
}

export class NavigationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: NavigationError): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: NavigationError, errorInfo: ErrorInfo): void {
    console.error("Navigation error:", error, errorInfo);
    error.info = errorInfo;
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Navigation Error</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {this.state.error?.message ||
                "An error occurred during navigation"}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
