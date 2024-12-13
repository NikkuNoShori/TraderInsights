import React from 'react';
import { Loader2 } from 'lucide-react';
import { PageHeader } from './PageHeader';

interface PageLoadingProps {
  title: string;
  subtitle?: string;
}

export function PageLoading({ title, subtitle }: PageLoadingProps) {
  return (
    <div className="flex-grow p-6">
      <PageHeader 
        title={title}
        subtitle={subtitle}
      />
      <div className="mt-8 flex flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      </div>
    </div>
  );
} 