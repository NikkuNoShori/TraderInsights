import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatsCardProps {
  title: string;
  value: string;
  icon: IconDefinition | LucideIcon;
  trend?: 'up' | 'down';
  className?: string;
  subtitle?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className, subtitle }: StatsCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg p-4",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-text-muted">{title}</p>
          <p className="text-2xl font-semibold text-text-primary">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center",
          trend === 'up' ? 'text-green-500 bg-green-500/10' : 
          trend === 'down' ? 'text-red-500 bg-red-500/10' : 
          'text-primary bg-primary/10'
        )}>
          {typeof Icon === 'function' ? (
            <Icon className="h-6 w-6" />
          ) : (
            <FontAwesomeIcon icon={Icon} className="h-6 w-6" />
          )}
        </div>
      </div>
      
      {trend && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          trend === 'up' ? 'bg-green-500' : 'bg-red-500'
        )} />
      )}
    </div>
  );
} 