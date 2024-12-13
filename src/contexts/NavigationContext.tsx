import React, { createContext, useContext, useState } from 'react';
import { NavigationErrorBoundary } from '../components/navigation/NavigationErrorBoundary';

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <NavigationErrorBoundary>
      <NavigationContext.Provider value={{ isNavigating, setIsNavigating }}>
        {children}
        {isNavigating && (
          <div className="fixed top-0 left-0 w-full h-1">
            <div className="h-full bg-primary animate-progress" />
          </div>
        )}
      </NavigationContext.Provider>
    </NavigationErrorBoundary>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}; 