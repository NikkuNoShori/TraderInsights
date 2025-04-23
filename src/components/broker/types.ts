import { SnapTradeConfig, SnaptradeBrokerage } from "@/lib/snaptrade/types";

export interface BrokerListProps {
  config: SnapTradeConfig;
  onSelect: (broker: SnaptradeBrokerage) => void;
}

export interface BrokerConnectionPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (authorizationId: string) => void;
  onError?: (error: {
    errorCode: string;
    statusCode: string;
    detail: string;
  }) => void;
  config: SnapTradeConfig;
  userId: string;
  userSecret: string;
}

export interface BrokerSessionState {
  userId?: string;
  userSecret?: string;
  lastSyncTime?: number;
  selectedAccountId?: string | null;
  expandedDescriptions?: Set<string>;
}
