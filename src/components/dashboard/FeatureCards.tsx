export function FeatureCards() {
  return (
    <div className="grid grid-cols-3 gap-6 px-6">
      <div className="bg-card dark:bg-gray-800 rounded-lg p-6 border border-border dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary/10 dark:bg-primary/5 rounded">
            <span className="text-primary-600 dark:text-primary-400">📚</span>
          </div>
          <h2 className="text-lg font-medium text-foreground dark:text-gray-200">
            Trading Journal
          </h2>
        </div>
        <p className="text-muted-foreground dark:text-gray-400">
          Track and analyze your trading history
        </p>
      </div>

      <div className="bg-card dark:bg-gray-800 rounded-lg p-6 border border-border dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary/10 dark:bg-primary/5 rounded">
            <span className="text-primary-600 dark:text-primary-400">📋</span>
          </div>
          <h2 className="text-lg font-medium text-foreground dark:text-gray-200">Watchlists</h2>
        </div>
        <p className="text-muted-foreground dark:text-gray-400">Monitor your favorite stocks</p>
      </div>

      <div className="bg-card dark:bg-gray-800 rounded-lg p-6 border border-border dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary/10 dark:bg-primary/5 rounded">
            <span className="text-primary-600 dark:text-primary-400">🔍</span>
          </div>
          <h2 className="text-lg font-medium text-foreground dark:text-gray-200">Stock Screener</h2>
        </div>
        <p className="text-muted-foreground dark:text-gray-400">Find stocks matching your criteria</p>
      </div>
    </div>
  );
} 