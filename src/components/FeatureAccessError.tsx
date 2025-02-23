import { useEffect } from '@/lib/hooks';
import { AlertTriangle } from 'lucide-react';

export interface FeatureAccessErrorProps {
  feature: string;
  message: string;
}

export function FeatureAccessError({ feature, message }: FeatureAccessErrorProps) {
  useEffect(() => {
    console.log('Feature access denied:', {
      feature,
      message,
      currentTime: new Date().toLocaleTimeString()
    });
  }, [feature, message]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-6">
        <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        {feature} Not Available
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
        {message}
      </p>
    </div>
  );
}