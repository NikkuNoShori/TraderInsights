import { X, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { useEffect } from "@/lib/react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "error",
  onClose,
  duration = 10000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={clsx(
        "fixed bottom-4 right-4 flex items-center p-4 rounded-lg shadow-lg space-x-3 transition-all duration-300",
        style={{ zIndex: 'var(--z-toast)' }},
        type === "error" && "bg-red-50 text-red-700",
        type === "success" && "bg-green-50 text-green-700",
        type === "info" && "bg-blue-50 text-blue-700",
      )}
    >
      <AlertCircle className="h-5 w-5" />
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
