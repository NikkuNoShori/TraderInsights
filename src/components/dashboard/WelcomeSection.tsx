import { useAuthStore } from "@/stores/authStore";
import { Search } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function WelcomeSection() {
  const { user } = useAuthStore();
  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Trader";

  return (
    <ErrorBoundary>
      <div className="border-b border-border">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-between items-center h-24">
            {/* Welcome Message */}
            <div>
              <h1 className="text-2xl font-semibold text-foreground dark:text-gray-200">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground dark:text-gray-400">
                Here's an overview of your trading activity
              </p>
            </div>

            {/* Search Box */}
            <div className="w-[400px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search symbols..."
                  className="w-full bg-background dark:bg-gray-800 
                           text-foreground dark:text-gray-200 
                           placeholder-muted-foreground dark:placeholder-gray-500
                           border border-input dark:border-gray-700 rounded-lg 
                           py-2 pl-10 pr-4 
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
