import { useResizeDetector } from 'react-resize-detector';
import { cn } from '../../lib/utils';
import { DASHBOARD_THEME } from '../../config/dashboardTheme';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  const { width, height, ref } = useResizeDetector();
  const { responsive, style } = DASHBOARD_THEME;
  
  // Calculate scale factor based on card size
  const scale = Math.min(
    width ? width / responsive.baseWidth : 1,
    height ? height / responsive.baseHeight : 1
  );

  return (
    <div 
      ref={ref}
      className={cn(
        "bg-card dark:bg-dark-paper",
        style.border && "border border-border dark:border-dark-border",
        "overflow-hidden",
        className
      )}
      style={{
        borderRadius: style.borderRadius,
        transition: style.transition
      }}
    >
      <div 
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          padding: `${16 / scale}px`, // Maintain consistent padding
          transition: `transform ${responsive.scaleDuration}ms`
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </div>
  );
} 