import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: 'open' | 'closed' | 'pending';
  className?: string;
}

const statusVariants = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  closed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'px-2 py-1 text-xs font-medium rounded-full',
        'transition-colors duration-150',
        statusVariants[status],
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
} 