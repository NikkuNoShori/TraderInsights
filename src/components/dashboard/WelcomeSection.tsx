import { useAuthStore } from '../../stores/authStore';
import { Search } from 'lucide-react';
import { ErrorBoundary } from '../ErrorBoundary';

export function WelcomeSection() {
  const { user } = useAuthStore();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader';

  return (
    <ErrorBoundary
      fallback={
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome back, {userName}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Track your trades, analyze your performance, and improve your strategy.
            </p>
          </div>
        </div>
      }
    >
      <div className="py-6 px-6 bg-background border-b border-border">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center">
            {/* Welcome Message */}
            <div className="pl-4">
              <h1 className="text-2xl font-semibold text-foreground dark:text-gray-200">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground dark:text-gray-400">
                Here's an overview of your trading activity
              </p>
            </div>

            {/* Search Box */}
            <div className="w-96 pr-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search symbols..."
                  className="w-full bg-background dark:bg-gray-800 
                             text-foreground dark:text-gray-200 
                             placeholder-muted-foreground dark:placeholder-gray-500
                             border border-input dark:border-gray-700 rounded-lg 
                             py-2 pl-12 pr-4 
                             focus:ring-2 focus:ring-primary focus:border-transparent
                             focus:outline-none
                             transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 