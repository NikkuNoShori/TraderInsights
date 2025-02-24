import { Plus } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  type: "number" | "string" | "boolean";
  operators: string[];
}

const filterOptions: FilterOption[] = [
  {
    id: "price",
    label: "Price",
    type: "number",
    operators: [">", "<", "=", ">=", "<="],
  },
  {
    id: "volume",
    label: "Volume",
    type: "number",
    operators: [">", "<", "=", ">=", "<="],
  },
  {
    id: "marketCap",
    label: "Market Cap",
    type: "number",
    operators: [">", "<", "=", ">=", "<="],
  },
];

interface FilterBuilderProps {
  onApply: (filters: any[]) => void;
}

export function FilterBuilder({ onApply }: FilterBuilderProps) {
  const [selectedMetric, setSelectedMetric] = useState(filterOptions[0].id);
  const [operator, setOperator] = useState(filterOptions[0].operators[0]);
  const [value, setValue] = useState("");

  const handleApply = () => {
    const filter = {
      metric: selectedMetric,
      operator,
      value: Number(value),
    };
    onApply([filter]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-end space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metric
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {filterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operator
          </label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {filterOptions
              .find((opt) => opt.id === selectedMetric)
              ?.operators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleApply}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Filter
        </button>
      </div>
    </div>
  );
}
