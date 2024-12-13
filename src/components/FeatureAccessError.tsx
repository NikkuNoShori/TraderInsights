import React from 'react';
import { Clock } from 'lucide-react';
import { marketConfig } from '../config/market';

interface FeatureAccessErrorProps {
  feature: string;
  startTime: string;
  endTime: string;
}

export function FeatureAccessError({ feature, startTime, endTime }: FeatureAccessErrorProps) {
  React.useEffect(() => {
    console.log('Feature access denied:', {
      feature,
      startTime,
      endTime,
      currentTime: new Date().toLocaleTimeString(),
      timezone: marketConfig.timezone
    });
  }, [feature, startTime, endTime]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-8">
      <Clock className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {feature} is currently unavailable
      </h2>
      <p className="text-gray-600 text-center max-w-md mb-4">
        This feature is only available between {startTime} and {endTime} ET during market hours.
      </p>
      <p className="text-sm text-gray-500 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Current time: {new Date().toLocaleTimeString()} ({marketConfig.timezone})
      </p>
    </div>
  );
}