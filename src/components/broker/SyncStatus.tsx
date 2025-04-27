interface SyncStatusProps {
  lastSyncTime?: number | string;
}

export function SyncStatus({ lastSyncTime }: SyncStatusProps) {
  if (!lastSyncTime) return null;

  const syncTime = typeof lastSyncTime === "string" 
    ? new Date(lastSyncTime).toLocaleTimeString()
    : new Date(lastSyncTime).toLocaleTimeString();

  return (
    <span className="text-sm text-gray-500">
      Last updated: {syncTime}
    </span>
  );
} 