import React from 'react';

export const TradeSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded mt-2" />
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div>
          <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}; 