import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

export function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}