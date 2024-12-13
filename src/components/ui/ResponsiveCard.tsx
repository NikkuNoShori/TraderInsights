import { cn } from '../../lib/utils';
import { useResizeDetector } from 'react-resize-detector';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  const { width, height, ref } = useResizeDetector();
  
  // Calculate scale factor based on card size
  const scale = Math.min(
    width ? width / 300 : 1,  // 300px is our base width
    height ? height / 200 : 1 // 200px is our base height
  );

  return (
    <div 
      ref={ref}
      className={cn(
        "bg-card dark:bg-dark-paper rounded-lg border border-border dark:border-dark-border",
        "overflow-hidden transition-all duration-200",
        className
      )}
    >
      <div 
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          padding: `${16 / scale}px` // Maintain consistent padding
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </div>
  );
} 