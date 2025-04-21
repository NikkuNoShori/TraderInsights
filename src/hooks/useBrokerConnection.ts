import { useState, useCallback } from "react";
import { toast } from "@/components/ui/toast";
import { SUPPORTED_BROKERS, BROKER_LIMITATIONS } from "@/config/brokers";

interface BrokerConnectionState {
  connectedBrokers: string[];
  isConnecting: boolean;
  error: string | null;
}

export function useBrokerConnection() {
  const [state, setState] = useState<BrokerConnectionState>({
    connectedBrokers: [],
    isConnecting: false,
    error: null,
  });

  const connectBroker = useCallback(
    async (brokerId: string) => {
      const broker = SUPPORTED_BROKERS.find((b) => b.id === brokerId);

      if (!broker) {
        toast.error("Invalid broker selected");
        return;
      }

      if (!broker.isSupported) {
        toast.error(`${broker.name} ${broker.reasonIfUnsupported}`);
        return;
      }

      if (state.connectedBrokers.length >= 5) {
        toast.error("Free plan limited to 5 broker connections");
        return;
      }

      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      try {
        // TODO: Implement actual SnapTrade connection logic here

        // For now, simulate connection
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setState((prev) => ({
          ...prev,
          connectedBrokers: [...prev.connectedBrokers, brokerId],
          isConnecting: false,
        }));

        toast.success(`Successfully connected to ${broker.name}`);
      } catch (error) {
        console.error("Failed to connect broker:", error);
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Failed to connect broker. Please try again.",
        }));
        toast.error("Failed to connect broker. Please try again.");
      }
    },
    [state.connectedBrokers]
  );

  const disconnectBroker = useCallback(async (brokerId: string) => {
    const broker = SUPPORTED_BROKERS.find((b) => b.id === brokerId);

    if (!broker) {
      toast.error("Invalid broker selected");
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // TODO: Implement actual SnapTrade disconnection logic here

      // For now, simulate disconnection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        connectedBrokers: prev.connectedBrokers.filter((id) => id !== brokerId),
        isConnecting: false,
      }));

      toast.success(`Successfully disconnected from ${broker.name}`);
    } catch (error) {
      console.error("Failed to disconnect broker:", error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: "Failed to disconnect broker. Please try again.",
      }));
      toast.error("Failed to disconnect broker. Please try again.");
    }
  }, []);

  const getBrokerStatus = useCallback(
    (brokerId: string) => {
      const broker = SUPPORTED_BROKERS.find((b) => b.id === brokerId);
      if (!broker) return { isSupported: false, isConnected: false };

      return {
        isSupported: broker.isSupported,
        isConnected: state.connectedBrokers.includes(brokerId),
        reasonIfUnsupported: broker.reasonIfUnsupported,
        limitations: BROKER_LIMITATIONS,
      };
    },
    [state.connectedBrokers]
  );

  return {
    ...state,
    connectBroker,
    disconnectBroker,
    getBrokerStatus,
    supportedBrokers: SUPPORTED_BROKERS,
    limitations: BROKER_LIMITATIONS,
  };
}
