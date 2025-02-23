import { Clock } from 'lucide-react';
import { getCurrentSession, type MarketSession } from '../utils/marketHours';

const sessionColors: Record<MarketSession, { bg: string; text: string }> = {
  premarket: { 
    bg: 'bg-blue-100 dark:bg-blue-900/50', 
    text: 'text-blue-800 dark:text-blue-200' 
  },
  regular: { 
    bg: 'bg-green-200 dark:bg-green-900/50', 
    text: 'text-green-900 dark:text-green-200' 
  },
  afterHours: { 
    bg: 'bg-purple-100 dark:bg-purple-900/50', 
    text: 'text-purple-800 dark:text-purple-200' 
  },
  closed: { 
    bg: 'bg-gray-100 dark:bg-gray-800', 
    text: 'text-gray-800 dark:text-gray-200' 
  }
};

const sessionLabels: Record<MarketSession, string> = {
  premarket: 'Pre-Market',
  regular: 'Market Open',
  afterHours: 'After Hours',
  closed: 'Market Closed'
};

export function MarketHoursIndicator() {
  const [session, setSession] = React.useState<MarketSession>(getCurrentSession());

  const updateSession = React.useCallback(() => {
    const newSession = getCurrentSession();
    if (newSession !== session) {
      console.log('Market session changed:', {
        from: session,
        to: newSession,
        time: new Date().toLocaleTimeString()
      });
      setSession(newSession);
    }
  }, [session]);

  React.useEffect(() => {
    // Initial update
    updateSession();
    
    // Update every minute
    const interval = setInterval(updateSession, 60000);

    return () => clearInterval(interval);
  }, [updateSession]);

  const { bg, text } = sessionColors[session];

  return (
    <div 
      className={`inline-flex items-center px-3 py-2 rounded-full ${bg} ${text}`}
      title={`Market ${session}`}
    >
      <Clock className="w-4 h-4 mr-2" />
      <span className="text-sm font-medium">{sessionLabels[session]}</span>
    </div>
  );
}