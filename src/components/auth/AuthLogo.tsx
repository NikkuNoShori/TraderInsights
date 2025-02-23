import { LineChart } from 'lucide-react';

const VERSION = '1.0.0-beta';

export function AuthLogo() {
  return (
    <div className="flex items-center justify-center">
      <LineChart className="h-5 w-5 text-primary-500 dark:text-primary-400 flex-shrink-0" />
      <div className="flex items-center ml-2">
        <span className="text-xl font-semibold text-gray-900 dark:text-white">
          Trading Insights
        </span>
        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] leading-none font-medium
                       bg-primary-100 text-primary-700
                       dark:bg-primary-900/30 dark:text-primary-300
                       rounded">
          {VERSION}
        </span>
      </div>
    </div>
  );
} 