import { useState, useEffect } from "@/lib/react";
import { PageHeader } from "../components/ui/PageHeader";
import { Construction } from "lucide-react";
import { PageLoading } from "../components/ui/PageLoading";

export default function Watchlist() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageLoading title="Watchlist" subtitle="Track your favorite stocks" />
    );
  }

  return (
    <div className="flex-grow p-6">
      <PageHeader title="Watchlist" subtitle="Track your favorite stocks" />
      <div className="mt-8 flex flex-col items-center justify-center text-center">
        <Construction className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Watchlist features are currently under development. Check back soon!
        </p>
      </div>
    </div>
  );
}
