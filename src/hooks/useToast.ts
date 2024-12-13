import React, { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ToastContainer = useCallback(() => {
    const getToastColor = (type: ToastType) => {
      switch (type) {
        case 'success': return 'bg-emerald-500';
        case 'error': return 'bg-rose-500';
        case 'warning': return 'bg-amber-500';
        default: return 'bg-primary-500';
      }
    };

    return React.createElement('div', 
      { className: 'fixed bottom-4 right-4 z-50 space-y-2' },
      toasts.map(t => 
        React.createElement('div', {
          key: t.id,
          className: `p-4 rounded-lg shadow-lg max-w-xs transform transition-all duration-300 ${getToastColor(t.type)} text-white`,
          onClick: () => removeToast(t.id),
          role: 'alert'
        }, 
        React.createElement('p', 
          { className: 'text-sm font-medium' }, 
          t.message
        ))
      )
    );
  }, [toasts, removeToast]);

  return {
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
    warning: (message: string) => addToast(message, 'warning'),
    addToast,
    removeToast,
    ToastContainer
  };
} 