import { isWithinInterval, set, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { marketConfig } from '../config/market';

export type MarketSession = 'premarket' | 'regular' | 'afterHours' | 'closed';
export type Feature = 'screener' | 'watchlist' | 'quotes';

const DEBUG = false;

const parseTimeString = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const today = new Date();
  const marketTime = set(today, { hours, minutes, seconds: 0, milliseconds: 0 });
  const zonedTime = zonedTimeToUtc(marketTime, marketConfig.timezone);
  
  if (DEBUG) {
    console.log('Parsed time:', {
      timeStr,
      marketTime: zonedTime.toLocaleTimeString(),
      timezone: marketConfig.timezone
    });
  }
  
  return zonedTime;
};

const getCurrentMarketTime = (): Date => {
  const now = new Date();
  const marketTime = utcToZonedTime(now, marketConfig.timezone);
  
  if (DEBUG) {
    console.log('Current market time:', {
      utc: now.toISOString(),
      market: marketTime.toLocaleTimeString(),
      timezone: marketConfig.timezone
    });
  }
  
  return marketTime;
};

export const isMarketOpen = (session: MarketSession): boolean => {
  const now = getCurrentMarketTime();
  const sessionConfig = marketConfig.marketHours[session];
  
  if (!sessionConfig || !sessionConfig.start || !sessionConfig.end) {
    if (DEBUG) console.log(`No config found for session: ${session}`);
    return false;
  }

  const sessionStart = parseTimeString(sessionConfig.start);
  const sessionEnd = parseTimeString(sessionConfig.end);

  const isOpen = isWithinInterval(now, { start: sessionStart, end: sessionEnd });
  
  if (DEBUG) {
    console.log('Market session check:', {
      session,
      start: sessionStart.toLocaleTimeString(),
      end: sessionEnd.toLocaleTimeString(),
      current: now.toLocaleTimeString(),
      isOpen
    });
  }
  
  return isOpen;
};

export const getCurrentSession = (): MarketSession => {
  // Check if we should update (only on the hour)
  const now = new Date();
  if (now.getMinutes() !== 0) {
    return isMarketOpen('regular') ? 'regular' :
           isMarketOpen('premarket') ? 'premarket' :
           isMarketOpen('afterHours') ? 'afterHours' : 'closed';
  }

  // Full check on the hour
  console.log('Performing hourly market status check:', now.toLocaleTimeString());
  if (isMarketOpen('regular')) return 'regular';
  if (isMarketOpen('premarket')) return 'premarket';
  if (isMarketOpen('afterHours')) return 'afterHours';
  return 'closed';
};

export const isFeatureAccessible = (feature: Feature): boolean => {
  const featureConfig = marketConfig.featureAccess[feature];

  if (!featureConfig) {
    console.error(`No configuration found for feature: ${feature}`);
    return false;
  }

  // If feature has no restrictions or is explicitly enabled without time restrictions
  if (!featureConfig.restrictions || featureConfig.enabled === true) {
    if (DEBUG) {
      console.log('Feature has no time restrictions:', {
        feature,
        config: featureConfig,
        result: true
      });
    }
    return true;
  }

  const now = getCurrentMarketTime();
  const featureStart = parseTimeString(featureConfig.start);
  const featureEnd = parseTimeString(featureConfig.end);

  const isAccessible = isWithinInterval(now, { start: featureStart, end: featureEnd });

  if (DEBUG) {
    console.log('Feature access check:', {
      feature,
      start: featureStart.toLocaleTimeString(),
      end: featureEnd.toLocaleTimeString(),
      result: isAccessible
    });
  }
  return isAccessible;
}