
export const MetricSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-dark-paper rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
      <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  );
}; 