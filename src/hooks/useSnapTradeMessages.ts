import { useEffect } from "react";

// Match the expected error type from SnapTradeReact
export interface ErrorData {
  code: string;
  status: number;
  message: string;
}

interface SnapTradeMessageHandlers {
  handleSuccess?: (authorizationId: string) => void;
  handleError?: (data: ErrorData) => void;
  handleExit?: () => void;
  close?: () => void;
}

/**
 * Custom hook to handle window messages from SnapTrade
 *
 * Based on the useWindowMessage hook from snaptrade-react
 * Used to handle SUCCESS, ERROR, CLOSED, and CLOSE_MODAL events
 */
export const useSnapTradeMessages = ({
  handleSuccess,
  handleError,
  handleExit,
  close,
}: SnapTradeMessageHandlers) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        // Parse the event data as JSON
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // Check if the message is from SnapTrade
        if (!data || !data.type) return;

        console.log("Received SnapTrade message:", data.type);

        // Handle different message types
        switch (data.type) {
          case "SUCCESS":
            console.log(
              "SnapTrade connection successful:",
              data.authorizationId
            );
            if (handleSuccess) handleSuccess(data.authorizationId);
            break;

          case "ERROR":
            console.error("SnapTrade connection error:", data);
            if (handleError && data.code && data.status && data.message) {
              handleError({
                code: data.code,
                status: data.status,
                message: data.message,
              });
            }
            break;

          case "CLOSED":
            console.log("SnapTrade connection closed");
            if (handleExit) handleExit();
            break;

          case "CLOSE_MODAL":
            console.log("SnapTrade modal closed");
            if (close) close();
            break;

          default:
            console.log("Unknown SnapTrade message type:", data.type);
        }
      } catch (error) {
        console.error("Error handling SnapTrade message:", error);
      }
    };

    // Add event listener
    window.addEventListener("message", handleMessage);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleSuccess, handleError, handleExit, close]);
};

export default useSnapTradeMessages;
