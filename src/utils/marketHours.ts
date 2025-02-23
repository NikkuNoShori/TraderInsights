import { isWithinInterval, set } from "date-fns";
import { toZonedTime } from "date-fns-tz";

type MarketSession = "premarket" | "regular" | "afterHours" | "closed";

interface MarketHours {
  premarket: { start: string; end: string };
  regular: { start: string; end: string };
  afterHours: { start: string; end: string };
}

interface MarketFeature {
  enabled: boolean;
  restrictions: boolean;
  start?: string;
  end?: string;
}

interface MarketConfig {
  marketHours: MarketHours;
  features: {
    trading: MarketFeature;
    orders: MarketFeature;
    quotes: MarketFeature;
  };
}

const marketConfig: MarketConfig = {
  marketHours: {
    premarket: { start: "04:00", end: "09:30" },
    regular: { start: "09:30", end: "16:00" },
    afterHours: { start: "16:00", end: "20:00" },
  },
  features: {
    trading: {
      enabled: true,
      restrictions: true,
      start: "09:30",
      end: "16:00",
    },
    orders: {
      enabled: true,
      restrictions: false,
      start: "04:00",
      end: "20:00",
    },
    quotes: {
      enabled: true,
      restrictions: false,
    },
  },
};

function parseTimeString(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return set(new Date(), { hours, minutes, seconds: 0, milliseconds: 0 });
}

export function getCurrentMarketSession(): MarketSession {
  const now = new Date();
  const nyTime = toZonedTime(now, "America/New_York");

  for (const session of ["premarket", "regular", "afterHours"] as const) {
    const { start, end } = marketConfig.marketHours[session];
    const sessionStart = parseTimeString(start);
    const sessionEnd = parseTimeString(end);

    if (isWithinInterval(nyTime, { start: sessionStart, end: sessionEnd })) {
      return session;
    }
  }

  return "closed";
}

export function isFeatureAvailable(
  feature: keyof MarketConfig["features"]
): boolean {
  const featureConfig = marketConfig.features[feature];
  if (!featureConfig.enabled) return false;

  if (!featureConfig.restrictions) return true;

  if (featureConfig.start && featureConfig.end) {
    const now = new Date();
    const nyTime = toZonedTime(now, "America/New_York");
    const featureStart = parseTimeString(featureConfig.start);
    const featureEnd = parseTimeString(featureConfig.end);

    return isWithinInterval(nyTime, { start: featureStart, end: featureEnd });
  }

  return true;
}
