import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-card rounded-lg border border-border shadow-sm",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
} 