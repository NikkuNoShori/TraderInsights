import React from "@/lib/react";
import { useState, useCallback, type ReactNode } from "@/lib/react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev: Toast[]) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev: Toast[]) => prev.filter((t: Toast) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev: Toast[]) => prev.filter((t: Toast) => t.id !== id));
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
            onClick: () => removeToast(t.id),
          },
          React.createElement(
            "p",
            { className: "text-sm font-medium" },
            t.message
          )
        )
      )
    );
  }, [toasts, removeToast]);

  return { addToast, removeToast, ToastContainer };
}
