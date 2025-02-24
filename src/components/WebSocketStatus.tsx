import { useWebSocketStore } from "@/lib/services/websocketManager";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/utils/cn";

export function WebSocketStatus() {
  const { isConnected, isConnecting, lastError, reconnectAttempts } = useWebSocketStore();

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
      {isConnected ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
      <span
        className={cn(
          "text-sm font-medium",
          isConnected ? "text-green-500" : "text-red-500"
        )}
      >
        {isConnected
          ? "Connected"
          : isConnecting
          ? "Connecting..."
          : "Disconnected"}
      </span>
      {lastError && !isConnected && (
        <span className="text-xs text-red-400">
          (Attempt {reconnectAttempts}/5)
        </span>
      )}
    </div>
  );
} 