import React from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { clsx } from 'clsx';

interface WidgetContainerProps {
  title: string;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export function WidgetContainer({
  title,
  isMinimized,
  onMinimize,
  onClose,
  children,
  className,
  headerActions
}: WidgetContainerProps) {
  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800/50 rounded-lg shadow-lg overflow-hidden h-full',
      className
    )}>
      <div className="widget-header flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 cursor-move">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
        <div className="flex items-center space-x-2">
          {headerActions}
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {!isMinimized && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}