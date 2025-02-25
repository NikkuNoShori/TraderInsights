export const marketConfig = {
  timezone: "America/New_York",
  marketHours: {
    premarket: {
      start: "04:00",
      end: "09:30",
    },
    regular: {
      start: "09:30",
      end: "16:00",
    },
    afterHours: {
      start: "16:00",
      end: "20:00",
    },
  },
  featureAccess: {
    quotes: {
      enabled: true,
      restrictions: true,
      start: "04:00",
      end: "20:00",
    },
    watchlist: {
      enabled: true,
      restrictions: false,
    },
  },
};
