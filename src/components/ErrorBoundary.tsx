import React from "@/lib/react";
import { AlertTriangle } from "lucide-react";
import { withErrorBoundary } from "./hoc/withErrorBoundary";
import {
  PageErrorFallback,
  CardErrorFallback,
  InputErrorFallback,
  ButtonErrorFallback,
} from "./ErrorFallbacks";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-error/10 rounded-lg">
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <p className="mt-2 text-error">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-error text-white rounded-md hover:opacity-90"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export specific error boundaries with their fallbacks
export const PageErrorBoundary = withErrorBoundary(
  ErrorBoundary,
  <PageErrorFallback />,
);
export const CardErrorBoundary = withErrorBoundary(
  ErrorBoundary,
  <CardErrorFallback />,
);
export const InputErrorBoundary = withErrorBoundary(
  ErrorBoundary,
  <InputErrorFallback />,
);
export const ButtonErrorBoundary = withErrorBoundary(
  ErrorBoundary,
  <ButtonErrorFallback />,
);
