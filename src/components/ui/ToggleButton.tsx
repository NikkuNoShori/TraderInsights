import { clsx } from 'clsx';

interface ToggleButtonProps {
  options: Array<{
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ToggleButton({ options, value, onChange, className }: ToggleButtonProps) {
  return (
    <div className={clsx('flex rounded-md shadow-sm', className)}>
      {options.map((option, index) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={clsx(
              'relative inline-flex items-center px-4 py-2 text-sm font-medium border transition-all duration-150',
              'focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              index === 0 && 'rounded-l-md',
              index === options.length - 1 && 'rounded-r-md',
              value === option.value
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            )}
          >
            {Icon && <Icon className={clsx('h-4 w-4', option.label && 'mr-2')} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}