import type { PropsWithChildren } from 'react';

export function ThemeWrapper({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {children}
    </div>
  );
} 