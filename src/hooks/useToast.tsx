import React from "@/lib/react";
import { useState, useCallback, type ReactNode } from "@/lib/react";
import { toast } from "react-hot-toast";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast(message, {
          icon: "⚠️",
        });
        break;
      default:
        toast(message);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  const ToastContainer = useCallback(() => {
    const toastClasses = {
      info: "bg-blue-500",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
    };

    return React.createElement(
      "div",
      { className: "fixed bottom-4 right-4 z-50 flex flex-col gap-2" },
      toasts.map((t: Toast) =>
        React.createElement(
          "div",
          {
            key: t.id,
            className: `${
              toastClasses[t.type]
            } text-white px-4 py-2 rounded shadow-lg cursor-pointer`,
            onClick: () => removeToast(t.id.toString()),
          },
          React.createElement(
            "p",
            { className: "text-sm font-medium" },
            t.message,
          ),
        ),
      ),
    );
  }, [toasts, removeToast]);

  return {
    addToast,
    removeToast,
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
    warning: (message: string) => addToast(message, "warning"),
    info: (message: string) => addToast(message, "info"),
    ToastContainer,
  };
}
