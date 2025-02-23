import { FilterBuilder } from './FilterBuilder';

interface Filter {
  metric: string;
  operator: string;
  value: number;
}

export function ScreenerFilters() {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

  const handleApplyFilter = (filters: Filter[]) => {
    setActiveFilters([...activeFilters, ...filters]);
  };

  return (
    <div className="space-y-4">
      <FilterBuilder onApply={handleApplyFilter} />
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Active Filters</h2>
        <div className="space-y-2">
          {activeFilters.map((filter, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <span className="text-sm text-gray-700">
                {filter.metric} {filter.operator} {filter.value}
              </span>
              <button
                onClick={() => {
                  const newFilters = [...activeFilters];
                  newFilters.splice(index, 1);
                  setActiveFilters(newFilters);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}