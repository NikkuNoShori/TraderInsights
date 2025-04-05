import { type ReactNode } from "@/lib/react";
import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrokerDataStore } from "@/stores/brokerDataStore";

interface BrokerCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  accountId?: string;
  loading?: boolean;
  error?: string | null;
}

export function BrokerCard({
  title,
  description,
  children,
  className = "",
  accountId,
  loading,
  error,
}: BrokerCardProps) {
  const { isLoading } = useBrokerDataStore();
  const isCardLoading = loading || isLoading;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="mt-4">
        {isCardLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
} 