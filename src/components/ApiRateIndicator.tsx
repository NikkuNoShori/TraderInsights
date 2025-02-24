import { Activity } from "lucide-react";
import { useApiStore } from "@/lib/services/polygonApi";
import { useAuthStore } from "@/stores/authStore";
import { clsx } from "clsx";

export function ApiRateIndicator() {
  const { user } = useAuthStore();
  const { remainingCalls } = useApiStore();

  if (!user || user.role !== "developer") {
    return null;
  }

  return (
    <div
      className={clsx(
        "fixed bottom-8 right-4 p-3 rounded-lg shadow-lg",
        "bg-white dark:bg-gray-800 border border-gray-200",
        "flex items-center space-x-2",
      )}
    >
      <Activity
        className={clsx(
          "h-4 w-4",
          remainingCalls > 2
            ? "text-green-500"
            : remainingCalls > 0
              ? "text-yellow-500"
              : "text-red-500",
        )}
      />
      <span className="text-sm font-medium">API Calls: {remainingCalls}/5</span>
    </div>
  );
}
