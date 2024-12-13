import React, { Component, ErrorInfo } from 'react';
import { XCircleIcon, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  isRetrying: boolean;
}

export class TradeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isRetrying: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRetrying: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Trade component error:', error, errorInfo);
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    try {
      if (this.props.onRetry) {
        await this.props.onRetry();
      }
      this.setState({ hasError: false, error: undefined });
    } catch (error) {
      this.setState({ 
        error: error instanceof Error ? error : new Error('Retry failed') 
      });
    } finally {
      this.setState({ isRetrying: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" />
              <span className="text-red-800 dark:text-red-200">
                Failed to load trade data
              </span>
            </div>
            <button
              onClick={this.handleRetry}
              disabled={this.state.isRetrying}
              className="flex items-center px-3 py-1 text-sm font-medium text-red-700 dark:text-red-300 
                       hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${
                this.state.isRetrying ? 'animate-spin' : ''
              }`} />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 