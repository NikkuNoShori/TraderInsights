import { toast as hotToast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right'
};

function createToast(message: string, type: 'success' | 'error' | 'info', options?: ToastOptions) {
  const finalOptions = { ...defaultOptions, ...options };

  const Icon = type === 'success' ? CheckCircle :
              type === 'error' ? XCircle :
              AlertCircle;

  return hotToast.custom(
    (t) => (
      <div
        className={`
          ${t.visible ? 'animate-enter' : 'animate-leave'}
          max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto
          flex items-center justify-between p-4 gap-4
          ${type === 'success' ? 'border-l-4 border-green-500' :
            type === 'error' ? 'border-l-4 border-red-500' :
            'border-l-4 border-blue-500'}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-6 h-6
              ${type === 'success' ? 'text-green-500' :
                type === 'error' ? 'text-red-500' :
                'text-blue-500'}
            `}
          />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
        </div>
        <button
          onClick={() => hotToast.dismiss(t.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    ),
    finalOptions
  );
}

export const toast = {
  success: (message: string, options?: ToastOptions) => createToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => createToast(message, 'error', options),
  info: (message: string, options?: ToastOptions) => createToast(message, 'info', options),
}; 