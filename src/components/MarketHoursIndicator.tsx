import { useState, useCallback, useEffect } from "@/lib/react";
import { getCurrentSession, type MarketSession } from "@/utils/marketHours";

interface MarketHoursIndicatorProps {
  className?: string;
}

export function MarketHoursIndicator({ className }: MarketHoursIndicatorProps) {
  const [session, setSession] = useState<MarketSession>(getCurrentSession());

  const updateSession = useCallback(() => {
    setSession(getCurrentSession());
  }, []);

  useEffect(() => {
    const interval = setInterval(updateSession, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [updateSession]);

  const getStatusColor = () => {
    switch (session) {
      case "regular":
        return "bg-green-500";
      case "premarket":
      case "afterHours":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  const getStatusText = () => {
    switch (session) {
      case "regular":
        return "Market Open";
      case "premarket":
        return "Pre-Market";
      case "afterHours":
        return "After Hours";
      default:
        return "Market Closed";
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
      <span className="text-sm">{getStatusText()}</span>
    </div>
  );
}
